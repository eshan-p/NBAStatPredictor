const mongoose = require('mongoose');

const standingSchema = new mongoose.Schema({
  team: {
    name: String,
    abbreviation: String,
    logo: String
  },
  conference: String,
  division: String,
  wins: Number,
  losses: Number,
  winPercentage: Number,
  gamesBack: String,
  streak: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Standing', standingSchema);