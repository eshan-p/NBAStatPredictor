const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    id: Number,
    season: Number,
    date: {
        start: Date,
        end: Date,
        duration: String
    },
    status: {
        clock: String,
        halftime: Boolean,
        long: String
    },
    periods: {
        current: Number,
        total: Number,
        endOfPeriod: Boolean
    },
    arena: {
        name: String,
        city: String,
        state: String,
        country: String
    },
    teams: {
        visitors: {
            id: Number,
            name: String,
            nickname: String,
            Code: String,
            logo: String
        },
        home: {
            id: Number,
            name: String,
            nickname: String,
            Code: String,
            logo: String
        }
    },
    scores: {
        visitors: {
            win: Number,
            loss: Number,
            series: {
                win: Number,
                loss: Number
            },
            linescore: Array,
            points: Number
        },
        home: {
            win: Number,
            loss: Number,
            series: {
                win: Number,
                loss: Number
            },
            linescore: Array,
            points: Number
        }
    },
    officials: Array,
    timesTied: Number,
    leadChanges: Number
});

module.exports = mongoose.model('Game', gameSchema);