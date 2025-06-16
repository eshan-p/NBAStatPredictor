const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    id: Number,
    firstname: String,
    lastname: String,
    birth: {
        date: String,
        country: String
    },
    nba: {
        start: Number,
        pro: Number
    },
    height: {
        feet: String,
        inches: String,
        meters: String
    },
    weight: {
        pounds: String,
        kilograms: String
    },
    college: String,
    affiliation: String,
    leagues: {
        standard: {
            jersey: Number,
            active: Boolean,
            pos: String
        }
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Player', playerSchema);