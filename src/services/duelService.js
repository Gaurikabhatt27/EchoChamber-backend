import Duel from '../models/Duel.js';
import User from '../models/Users.js';
import { io } from '../server.js';
import { isContentSafe } from './aiModerationService.js';

export const createDuel = async (topic, challengerId) => {
  const duel = new Duel({ topic, challenger: challengerId });
  await duel.save();
  return await duel.populate('challenger', 'name');
};

export const joinDuel = async (duelId, defenderId) => {
  const duel = await Duel.findById(duelId);
  if (!duel) throw new Error('Duel not found');
  if (duel.status !== 'waiting') throw new Error('Duel has already started');
  if (duel.challenger.toString() === defenderId.toString()) throw new Error('You cannot duel yourself!');

  duel.defender = defenderId;
  duel.status = 'active'; // Begin!
  duel.timeRemaining = 120; // 120s rounds
  
  await duel.save();
  
  const populatedDuel = await duel.populate([
    { path: 'challenger', select: 'name' },
    { path: 'defender', select: 'name' }
  ]);

  // Tell everyone in the duel room the match has officially started
  io.to(`duel_${duel._id}`).emit('duel_started', populatedDuel);

  return populatedDuel;
};

export const getDuels = async () => {
  // Return all waiting and active duels for the dashboard to show
  return await Duel.find({ status: { $in: ['waiting', 'active', 'voting'] } })
    .populate('challenger', 'name reputationScore')
    .populate('defender', 'name reputationScore')
    .sort({ createdAt: -1 });
};

export const getDuelById = async (duelId) => {
  return await Duel.findById(duelId)
    .populate('challenger', 'name reputationScore')
    .populate('defender', 'name reputationScore');
};

export const getUserDuelHistory = async (userId) => {
  return await Duel.find({
    status: 'finished',
    $or: [{ challenger: userId }, { defender: userId }]
  })
    .populate('challenger', 'name reputationScore')
    .populate('defender', 'name reputationScore')
    .sort({ updatedAt: -1 });
};

export const submitPoint = async (duelId, userId, text) => {
  const duel = await Duel.findById(duelId);
  if (!duel) throw new Error('Duel not found');
  if (duel.status !== 'active') throw new Error('It is not the active typing phase!');

  // Trust & Safety first
  const isSafe = await isContentSafe(text);
  if (!isSafe) {
    throw new Error('Your argument violates our community guidelines and cannot be posted.');
  }

  let side = '';

  if (duel.challenger.toString() === userId.toString()) {
    duel.challengerPoints.push({ text });
    side = 'challenger';
  } else if (duel.defender.toString() === userId.toString()) {
    duel.defenderPoints.push({ text });
    side = 'defender';
  } else {
    throw new Error('You are not a participant in this duel!');
  }

  await duel.save();

  // Instantly broadcast the point to the room so the opponent sees it
  io.to(`duel_${duel._id}`).emit('duel_point_added', { side, text });
  
  return duel;
};

export const castDuelVote = async (duelId, userId, voteFor) => {
  const duel = await Duel.findById(duelId);
  if (!duel) throw new Error('Duel not found');
  if (duel.status !== 'voting') throw new Error('Voting is closed.');

  if (duel.challenger.toString() === userId.toString() || duel.defender.toString() === userId.toString()) {
    throw new Error('Participants cannot vote for themselves.');
  }

  // Prevent double voting
  if (duel.votes.challengerVotes.includes(userId) || duel.votes.defenderVotes.includes(userId)) {
     throw new Error('You have already cast your vote.');
  }

  if (voteFor === 'challenger') {
    duel.votes.challengerVotes.push(userId);
  } else if (voteFor === 'defender') {
    duel.votes.defenderVotes.push(userId);
  }

  await duel.save();
  return duel;
};
