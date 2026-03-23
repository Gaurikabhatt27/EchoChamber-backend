import * as authService from '../services/authServices.js';

export const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error(error.stack);
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser(email, password);
    res.status(200).json(data);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await authService.getLeaderboard();
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};