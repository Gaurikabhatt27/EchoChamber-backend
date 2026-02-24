import Task from '../models/Task.js';

export const createArgument = async (taskData) => {
  const task = new Task(taskData);
  return await task.save();
};

export const getArgumentsByProject = async (projectId) => {
  return await Task.find({ project: projectId }).populate('user', 'name');
};