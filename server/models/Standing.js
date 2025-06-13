const mongoose = require('mongoose');

const standingSchema = new mongoose.Schema({
  league: String,
  season: Number,
  team: {
    id: Number,
    name: String,
    nickname: String,
    code: String,
    logo: String
  },
  conference: {
    name: String,
    rank: Number,
    win: Number,
    loss: Number
  },
  division: {
    name: String,
    rank: Number,
    win: Number,
    loss: Number,
    gamesBehind: String
  },
  win: {
    home: Number,
    away: Number,
    total: Number,
    percentage: String,
    lastTen: Number
  },
  loss: {
    home: Number,
    away: Number,
    total: Number,
    percentage: String,
    lastTen: Number
  },
  gamesBehind: String,
  streak: Number,
  winStreak: Boolean,
  //tieBreakerPoints: null,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Standing', standingSchema);