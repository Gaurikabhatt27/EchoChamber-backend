const Project = require('../models/Project');

const createProject = async (projectData) => {
  const project = new Project(projectData);
  return await project.save();
};

const getAllProjects = async () => {
  return await Project.find().populate('creator', 'name');
};

module.exports = { createProject, getAllProjects };