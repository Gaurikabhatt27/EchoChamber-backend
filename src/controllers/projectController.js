import * as projectService from '../services/projectService.js';

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
    res.status(200).json(updatedProject);
  } catch (error) {
    if (error.message === 'Project not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};
