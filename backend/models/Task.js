const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
      maxlength: [100, 'Task title cannot exceed 100 characters.']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Task description cannot exceed 500 characters.']
    },
    // Naya status field add kiya gaya
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);