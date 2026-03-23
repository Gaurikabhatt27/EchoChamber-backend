import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import connectDB from './config/db.js';
import 'dotenv/config';

import http from 'http';
import { Server } from 'socket.io';

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io server
export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Adjust this if your frontend runs on a different port
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});

import Duel from './models/Duel.js';

io.on('connection', (socket) => {
  console.log('⚡ A user connected to WebSocket:', socket.id);

  // General Debate Room Listening
  socket.on('join_project', (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project room: ${projectId}`);
  });

  // Duel Specific Room Listening
  socket.on('join_duel', (duelId) => {
    socket.join(`duel_${duelId}`);
    console.log(`User ${socket.id} joined DUEL room: ${duelId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected:', socket.id);
  });
});

// ==========================================
// CENTRAL GAME LOOP FOR DUELS
// ==========================================
// Check active duels every 1000ms (1 second)
setInterval(async () => {
  try {
    // 1. Tick the Active Phase (Typing Argument)
    const activeDuels = await Duel.find({ status: 'active' });
    
    for (const duel of activeDuels) {
      if (duel.timeRemaining > 0) {
        duel.timeRemaining -= 1;
        await duel.save();
        io.to(`duel_${duel._id}`).emit('duel_timer_tick', { 
          phase: 'active', 
          timeRemaining: duel.timeRemaining 
        });
      } else {
        // Transition to Voting Phase
        duel.status = 'voting';
        duel.timeRemaining = 30; // 30 seconds for voting
        await duel.save();
        io.to(`duel_${duel._id}`).emit('duel_phase_change', { 
          status: 'voting', 
          timeRemaining: 30 
        });
      }
    }

    // 2. Tick the Voting Phase 
    const votingDuels = await Duel.find({ status: 'voting' });

    for (const duel of votingDuels) {
      if (duel.timeRemaining > 0) {
        duel.timeRemaining -= 1;
        await duel.save();
        io.to(`duel_${duel._id}`).emit('duel_timer_tick', { 
          phase: 'voting', 
          timeRemaining: duel.timeRemaining 
        });
      } else {
        // Transition to Finished
        duel.status = 'finished';
        duel.timeRemaining = 0;
        
        // Count votes and determine winner
        const challengerVotes = duel.votes?.challengerVotes?.length || 0;
        const defenderVotes = duel.votes?.defenderVotes?.length || 0;
        
        if (challengerVotes > defenderVotes) {
          duel.winner = duel.challenger;
        } else if (defenderVotes > challengerVotes) {
          duel.winner = duel.defender;
        } else {
          // Tiebreaker: Whoever fired more points wins!
          const challengerPoints = duel.challengerPoints?.length || 0;
          const defenderPoints = duel.defenderPoints?.length || 0;
          if (challengerPoints > defenderPoints) {
            duel.winner = duel.challenger;
          } else if (defenderPoints > challengerPoints) {
            duel.winner = duel.defender;
          }
          // If still exactly equal, duel.winner remains null for a true DRAW!
        }

        await duel.save();
        io.to(`duel_${duel._id}`).emit('duel_phase_change', { 
          status: 'finished', 
          winner: duel.winner 
        });
      }
    }
  } catch (error) {
    console.error('Game Loop Error:', error);
  }
}, 1000);

server.listen(PORT, () => {
  console.log(`🚀 Server and WebSocket running on port ${PORT}`);
});