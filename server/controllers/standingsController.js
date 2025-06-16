const Standing = require('../models/Standing');
const axios = require('axios');

// Load environment variables
require('dotenv').config();
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'api-nba-v1.p.rapidapi.com';

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

exports.getStandings = async (req, res) => {
  try {
    // Check if we have recent data (within last 1 week)
    const recentStandings = await Standing.find({
      lastUpdated: { $gte: new Date(Date.now() - ONE_WEEK) }
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
      league: standing.league,
      season: standing.season,
      team: {
        id: standing.team.id,
        name: standing.team.name,
        nickname: standing.team.nickname,
        code: standing.team.code,
        logo: standing.team.logo
      },
      conference: {
        name: standing.conference.name,
        rank: standing.conference.rank,
        win: standing.conference.win,
        loss: standing.conference.loss
      },
      division: {
        name: standing.division.name,
        rank: standing.division.rank,
        win: standing.division.win,
        loss: standing.division.loss,
        gamesBehind: standing.gamesBehind || '0'
      },
      win: {
        home: standing.win.home,
        away: standing.win.away,
        total: standing.win.total,
        percentage: standing.win.percentage,
        lastTen: standing.win.lastTen
      },
      loss: {
        home: standing.loss.home,
        away: standing.loss.away,
        total: standing.loss.total,
        percentage: standing.loss.percentage,
        lastTen: standing.loss.lastTen
      },
      gamesBehind: standing.gamesBehind || '0',
      streak: standing.streak,
      winStreak: standing.winStreak,
      //tieBreakerPoints: null, // Assuming this is not provided by the API
      lastUpdated: new Date()
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