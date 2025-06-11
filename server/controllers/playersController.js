const Player = require('../models/Player');
const axios = require('axios');

require('dotenv').config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'api-nba-v1.p.rapidapi.com';

exports.getPlayers = async (req, res) => {
  try {
    // Check if we have recent data (within last 4 hours)
    const recentPlayers = await Player.find({
      lastUpdated: { $gte: new Date(Date.now() - 14400000) }
    }).sort({ lastname: 1 });

    if (recentPlayers.length > 0) {
      return res.json(recentPlayers);
    }

    // Fetch current season players from RapidAPI NBA
    const playersResponse = await axios.get('https://api-nba-v1.p.rapidapi.com/players', {
      params: {
        team: '2',
        season: '2024'
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    const players = playersResponse.data.response.map(player => ({
        id: player.id,
        firstname: player.firstname,
        lastname: player.lastname,
        birth: {
        date: player.birth.date,
        country: player.birth.country
        },
        nba: {
            start: player.nba.start,
            pro: player.nba.pro
        },
        height: {
            feet: player.height.feet,
            inches: player.height.inches,
            meters: player.height.meters
        },
        weight: {
            pounds: player.weight.pounds,
            kilograms: player.weight.kilograms
        },
        college: player.college,
        affiliation: player.affiliation,
        leagues: {
            standard: {
                jersey: player.leagues.standard.jersey,
                active: player.leagues.standard.active,
                pos: player.leagues.standard.pos
            }
        }
    }));

    // Clear old data and save new data
    await Player.deleteMany({});
    await Player.insertMany(players);

    res.json(players);
    } catch (error) {
    console.error('Error fetching players:', error);

    // If API fails, try to return cached data (even if older)
    const cachedPlayers = await Player.find({}).sort({ lastname: 1 });

    if (cachedPlayers.length > 0) {
      console.log('Returning cached players data');
      return res.json(cachedPlayers);
    } 

    res.status(500).json({ 
      message: 'Error fetching players',
      error: error.message 
    });
  }
};