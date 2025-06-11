const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    id: Number,
    firstname: String,
    lastname: String,
    birth: {
        date: Date,
        country: String
    },
    nba: {
        start: Number,
        pro: Number
    },
    height: {
        feet: Number,
        inches: Number,
        meters: Number
    },
    weight: {
        pounds: Number,
        kilograms: Number
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