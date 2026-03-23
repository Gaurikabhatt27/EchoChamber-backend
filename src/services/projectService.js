import Project from '../models/Project.js';
import User from '../models/Users.js';
import Task from '../models/Task.js';
import { GoogleGenAI } from '@google/genai';
import { isContentSafe } from './aiModerationService.js';

export const createProject = async (projectData) => {
  const project = new Project(projectData);
  return await project.save();
};

export const getAllProjects = async ({ search, sortBy } = {}) => {
  let query = {};
  if (search) {
    query = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    };
  }

  let projectsQuery = Project.find(query).populate('creator', 'name');

  if (sortBy === 'new') {
    projectsQuery = projectsQuery.sort({ createdAt: -1 });
  }

  const projects = await projectsQuery.exec();

  if (sortBy === 'top' || sortBy === 'hot') {
    projects.sort((a, b) => {
      const aScore = (a.upvotes?.length || 0) - (a.downvotes?.length || 0);
      const bScore = (b.upvotes?.length || 0) - (b.downvotes?.length || 0);
      return bScore - aScore;
    });
  }

  return projects;
};

export const voteOnProject = async (projectId, userId, voteType) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  if (!project.upvotes) project.upvotes = [];
  if (!project.downvotes) project.downvotes = [];

  // Prevent duplicate voting and manage logic properly
  const hasUpvoted = project.upvotes.some(id => id.toString() === userId.toString());
  const hasDownvoted = project.downvotes.some(id => id.toString() === userId.toString());

  let reputationChange = 0;

  if (voteType === 'upvote') {
    if (!hasUpvoted) {
      project.upvotes.push(userId);
      reputationChange += 5; // Reward
      if (hasDownvoted) {
        project.downvotes.pull(userId);
        reputationChange += 2; // Reversing a downvote
      }
    }
  } else if (voteType === 'downvote') {
    if (!hasDownvoted) {
      project.downvotes.push(userId);
      reputationChange -= 2; // Penalty
      if (hasUpvoted) {
        project.upvotes.pull(userId);
        reputationChange -= 5; // Reversing an upvote
      }
    }
  } else if (voteType === 'remove') {
    if (hasUpvoted) {
      project.upvotes.pull(userId);
      reputationChange -= 5; // Removing upvote
    }
    if (hasDownvoted) {
      project.downvotes.pull(userId);
      reputationChange += 2; // Removing downvote
    }
  }

  await project.save();

  // Update reputation for the project creator
  if (reputationChange !== 0 && project.creator) {
    await User.findByIdAndUpdate(project.creator, {
      $inc: { reputationScore: reputationChange }
    });
  }

  return project;
};

import Comment from '../models/Comment.js';

export const addComment = async (projectId, text, authorId, parentCommentId = null) => {
  // Pass the comment text through the GenAI Content Moderator
  const isSafe = await isContentSafe(text);
  if (!isSafe) {
    throw new Error('Your comment violates our community guidelines (hate speech, severe profanity, or harassment) and cannot be posted.');
  }

  const comment = new Comment({
    text,
    author: authorId,
    project: projectId,
    parentComment: parentCommentId || null
  });
  
  await comment.save();
  return await comment.populate('author', 'name reputationScore');
};

export const getCommentsForProject = async (projectId) => {
  return await Comment.find({ project: projectId })
    .populate('author', 'name reputationScore')
    .sort({ createdAt: 1 }); // Oldest first (top down reading flow)
};

export const analyzeDebateWithAI = async (projectId) => {
  // 1. Fetch project and arguments
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const tasks = await Task.find({ project: projectId }).populate('user', 'name');
  if (tasks.length === 0) {
    return 'Not enough arguments to analyze the debate yet.';
  }

  // 2. Separate into Pro and Con
  const proArgs = tasks.filter(t => t.stance === 'pro').map(t => `- ${t.user?.name || 'Anonymous'}: ${t.content}`).join('\n');
  const conArgs = tasks.filter(t => t.stance === 'con').map(t => `- ${t.user?.name || 'Anonymous'}: ${t.content}`).join('\n');

  // 3. Construct the prompt
  const prompt = `
You are an expert Debate Analyzer.
Topic: ${project.title}
Description: ${project.description}

PRO Arguments:
${proArgs || 'None'}

CON Arguments:
${conArgs || 'None'}

Analyze the arguments provided above and determine which side is stronger.
Return your analysis EXACTLY as a valid JSON object with the following schema, and no other markdown or text:
{
  "proPercentage": Number (0-100),
  "conPercentage": Number (0-100),
  "shortReason": "A 1-2 sentence concise explanation of why this split was chosen"
}
Ensure proPercentage + conPercentage exactly equals 100.
  `;

  // 4. Call Gemini AI
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    // Clean potential markdown blocks
    const rawText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(rawText);
    return parsedData;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze debate. Ensure API key is set and valid.');
  }
};