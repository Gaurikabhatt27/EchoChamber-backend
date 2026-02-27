import Project from '../models/Project.js';
import User from '../models/Users.js';

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

  // Prevent duplicate voting and manage logic properly
  const hasUpvoted = project.upvotes.includes(userId);
  const hasDownvoted = project.downvotes.includes(userId);

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