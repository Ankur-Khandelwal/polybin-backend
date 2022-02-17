const mongoose = require('mongoose');
const polySchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: 'Untitled'
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true,
    trim: true 
  },
  createdBy: {
    type: String,
    default: 'Anonymous'
  },
  visibility: {
    type: String,
    required: true,
    default: 'public'
  },
  key: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expireAfterSeconds: {
    type: Number,
    required: true
  },
  expiryDuration: {
    type: String,
    required: true,
    default: '1 day'
  },
  link: {
    type: String
  },
  ipArray: [{
    time: Date,
    ip: String
  }]
}, {timestamps: true});

const Poly = mongoose.model('Poly', polySchema);
module.exports = Poly;