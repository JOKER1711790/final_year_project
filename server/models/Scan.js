
const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
  },
  threatLevel: {
    type: String,
    default: 'none',
  },
  threats: {
    type: Number,
    default: 0,
  },
  findings: {
    type: Array,
    default: [],
  },
  results: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  duration: {
    type: Number,
  },
});

module.exports = mongoose.model('Scan', ScanSchema);
