const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    id: Number,
    name: String,
    nickname: String,
    code: String,
    logo: String,
    allStar: Boolean,
    nbaFranchise: Boolean,
    leagues: {
        standard: {
            conference: String,
            division: String
        }
    }
});

module.exports = mongoose.model('Team', teamSchema);