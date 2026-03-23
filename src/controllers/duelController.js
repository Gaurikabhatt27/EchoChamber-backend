import * as duelService from '../services/duelService.js';

export const createDuel = async (req, res) => {
  try {
    const { topic } = req.body;
    const duel = await duelService.createDuel(topic, req.user.id);
    res.status(201).json(duel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const joinDuel = async (req, res) => {
  try {
    const { id } = req.params;
    const duel = await duelService.joinDuel(id, req.user.id);
    res.status(200).json(duel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getDuels = async (req, res) => {
  try {
    const duels = await duelService.getDuels();
    res.status(200).json(duels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDuelById = async (req, res) => {
  try {
    const { id } = req.params;
    const duel = await duelService.getDuelById(id);
    res.status(200).json(duel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserDuelHistory = async (req, res) => {
  try {
    const duels = await duelService.getUserDuelHistory(req.user.id);
    res.status(200).json(duels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const submitPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    await duelService.submitPoint(id, req.user.id, text);
    res.status(200).json({ message: 'Point appended' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const castDuelVote = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteFor } = req.body; // 'challenger' or 'defender'
    await duelService.castDuelVote(id, req.user.id, voteFor);
    res.status(200).json({ message: 'Vote registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
