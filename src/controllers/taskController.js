import * as taskService from '../services/taskService.js';

export const postArgument = async (req, res) => {
  try {
    const argumentData = { ...req.body, user: req.user.id };
    const task = await taskService.createArgument(argumentData);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getRoomDebate = async (req, res) => {
  try {
    const tasks = await taskService.getArgumentsByProject(req.params.projectId);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};