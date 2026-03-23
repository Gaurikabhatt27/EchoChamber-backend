import * as projectService from '../services/projectService.js';
import { io } from '../server.js';

export const create = async (req, res) => {
  try {
    const projectData = { ...req.body, creator: req.user.id };
    const project = await projectService.createProject(projectData);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const { search, sortBy } = req.query;
    const projects = await projectService.getAllProjects({ search, sortBy });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const voteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;
    const userId = req.user.id;

    const updatedProject = await projectService.voteOnProject(id, userId, voteType);
    
    // Broadcast the updated vote counts to ALL connected clients (for the dashboard)
    // and specifically to the project room (if viewing details)
    io.emit('project_voted', {
      projectId: updatedProject._id,
      upvotes: updatedProject.upvotes,
      downvotes: updatedProject.downvotes
    });
    
    res.status(200).json(updatedProject);
  } catch (error) {
    if (error.message === 'Project not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, parentCommentId } = req.body;
    const userId = req.user.id;

    const comment = await projectService.addComment(id, text, userId, parentCommentId);
    
    // Broadcast new comment to the specific project room
    io.to(id.toString()).emit('new_comment', comment);

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await projectService.getCommentsForProject(id);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const analyzeDebate = async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await projectService.analyzeDebateWithAI(id);
    res.status(200).json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
