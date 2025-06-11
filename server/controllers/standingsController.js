const Standing = require('../models/Standing');
const axios = require('axios');

require('dotenv').config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'api-nba-v1.p.rapidapi.com';

exports.getStandings = async (req, res) => {
  try {
    // Check if we have recent data (within last 4 hours)
    const recentStandings = await Standing.find({
      lastUpdated: { $gte: new Date(Date.now() - 14400000) }
    }).sort({ conference: 1, winPercentage: -1 });

    if (recentStandings.length > 0) {
      return res.json(recentStandings);
    }

    // Fetch current season standings from RapidAPI NBA
    const standingsResponse = await axios.get('https://api-nba-v1.p.rapidapi.com/standings', {
      params: {
        league: 'standard',
        season: '2024'
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    // Transform the API response to match our schema
    const standings = standingsResponse.data.response.map(standing => ({
      team: {
        name: standing.team.name,
        abbreviation: standing.team.code,
        logo: standing.team.logo
      },
      conference: standing.conference.name,
      division: standing.division.name,
      wins: standing.win.total,
      losses: standing.loss.total,
      winPercentage: parseFloat(standing.win.percentage) || 0,
      gamesBack: standing.gamesBehind || '0',
      streak: standing.streak > 0 ? `W${standing.streak}` : `L${Math.abs(standing.streak)}`
    }));

    // Clear old data and save new data
    await Standing.deleteMany({});
    await Standing.insertMany(standings);
    
    res.json(standings);

  } catch (error) {
    console.error('Error fetching standings:', error);
    
    // If API fails, try to return cached data (even if older)
    const cachedStandings = await Standing.find({}).sort({ conference: 1, winPercentage: -1 });
    
    if (cachedStandings.length > 0) {
      console.log('Returning cached standings data');
      return res.json(cachedStandings);
    }
    
    res.status(500).json({ 
      message: 'Error fetching standings',
      error: error.message 
    });
  }
};

exports.getStandingsRaw = async (req, res) => {
  try {
    const standings = await Standing.find({});
    console.log('Raw standings from DB:', JSON.stringify(standings[0], null, 2));
    res.json(standings);
  } catch (error) {
    console.error('Error fetching raw standings:', error);
    res.status(500).json({ error: error.message });
  }
};