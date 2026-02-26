const Project = require('../models/Project');

const createProject = async (projectData) => {
  const project = new Project(projectData);
  return await project.save();
};

<<<<<<< Updated upstream
const getAllProjects = async () => {
  return await Project.find().populate('creator', 'name');
};

module.exports = { createProject, getAllProjects };
=======
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
    // Custom sort based on the derived score
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

  const update = {};

  if (voteType === 'upvote') {
    // If the user hasn't upvoted yet, add them to upvotes and remove them from downvotes
    update.$addToSet = { upvotes: userId };
    update.$pull = { downvotes: userId };
  } else if (voteType === 'downvote') {
    // If the user hasn't downvoted yet, add them to downvotes and remove them from upvotes
    update.$addToSet = { downvotes: userId };
    update.$pull = { upvotes: userId };
  } else if (voteType === 'remove') {
    // Remove the user's vote completely if they click an active vote again
    update.$pull = { upvotes: userId, downvotes: userId };
  } else {
    throw new Error('Invalid vote type');
  }

  // Find by ID and apply the atomic update, returning the newly updated document
  return await Project.findByIdAndUpdate(projectId, update, { new: true }).populate('creator', 'name');
};
>>>>>>> Stashed changes
