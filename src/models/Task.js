import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  content: { type: String, required: true },
  stance: { 
    type: String, 
    enum: ['pro', 'con'], 
    required: true 
  },
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);