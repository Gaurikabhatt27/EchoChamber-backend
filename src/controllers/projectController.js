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
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};