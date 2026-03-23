import Task from '../models/Task.js';
import { isContentSafe } from './aiModerationService.js';

export const createArgument = async (taskData) => {
  // Pass the argument text through the GenAI Content Moderator
  const isSafe = await isContentSafe(taskData.content);
  if (!isSafe) {
    throw new Error('Your argument violates our community guidelines (hate speech, severe profanity, or harassment) and cannot be posted.');
  }

  const task = new Task(taskData);
  return await task.save();
};

export const getArgumentsByProject = async (projectId) => {
  return await Task.find({ project: projectId }).populate('user', 'name');
};