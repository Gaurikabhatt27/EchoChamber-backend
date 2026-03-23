import mongoose from 'mongoose';

const duelSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true
  },
  challenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  defender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Someone has to accept the duel to fill this slot
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'voting', 'finished'],
    default: 'waiting'
  },
  timeRemaining: {
    type: Number,
    default: 120 // 120 seconds for active typing phase
  },
  challengerPoints: [{
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  defenderPoints: [{
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  votes: {
    challengerVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    defenderVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

export default mongoose.model('Duel', duelSchema);
