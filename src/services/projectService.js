import Project from '../models/Project.js';

export const createProject = async (projectData) => {
  const project = new Project(projectData);
  return await project.save();
};

export const getAllProjects = async () => {
  return await Project.find().populate('creator', 'name');
};