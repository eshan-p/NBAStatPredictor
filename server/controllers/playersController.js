const Player = require("../models/Player");
const axios = require("axios");

// Load environment variables
require("dotenv").config();
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "api-nba-v1.p.rapidapi.com";

let teamIds = [
  1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30, 31, 38, 40, 41,
]; // NBA team IDs (API contains non-NBA teams as well)

// Variables for rate limiting
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // Delay function for rate limiting
const TWELVE_HOURS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

// Rate limiting variables
const MAX_REQUESTS_PER_MINUTE = 10;      // Maximum requests per minute
const MAX_REQUESTS_PER_DAY = 100;        // Maximum requests per day
const MINUTE_IN_MS = 60 * 1000;          // 1 minute in milliseconds
const DAY_IN_MS = 24 * 60 * 60 * 1000;   // 1 day in milliseconds

// Rate limiting trackers
let requestsInLastMinute = [];
let requestsInLastDay = [];

// Function to check if we can make a request
const canMakeRequest = () => {
  const now = Date.now();

  // Clean old requests from tracking arrays
  requestsInLastMinute = requestsInLastMinute.filter(time => now - time < MINUTE_IN_MS);
  requestsInLastDay = requestsInLastDay.filter(time => now - time < DAY_IN_MS);

  return requestsInLastMinute.length < MAX_REQUESTS_PER_MINUTE &&
         requestsInLastDay.length < MAX_REQUESTS_PER_DAY;
};

// Function to record a request
const recordRequest = () => {
  const now = Date.now();
  requestsInLastMinute.push(now);
  requestsInLastDay.push(now);
};

// Function to calculate delay needed to respect rate limits
const calculateDelay = () => {
  if (requestsInLastMinute.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestRequest = Math.min(...requestsInLastMinute);
    return MINUTE_IN_MS - (Date.now() - oldestRequest) + 1000; // Add 1 second buffer
  }
  return 6000; // Default to 6 seconds if under limit
};

// Function to fetch player stats from NBA API
const fetchPlayerStats = async (playerId) => {
  try {
    if (!canMakeRequest()) {
      const delayTime = calculateDelay();
      console.log(`Rate limit reached, waiting for ${delayTime} ms`);
      await delay(delayTime);
    }

    recordRequest();

    const statsResponse = await axios.get(
      "https://api-nba-v1.p.rapidapi.com/players/statistics",
      {
        params: {
          id: playerId,
          season: "2024",
        },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
      }
    );

    return statsResponse.data?.response || [];
  } catch (error) {
    console.error(`Error fetching player stats for ${playerId}:`, error.message);
    return null;
  }
};

// Function to get players from the database or API      
exports.getPlayers = async (req, res) => {
  try {
    // Check if we have recent data (within last 1 week)
    const recentPlayers = await Player.find({
      lastUpdated: { $gte: new Date(Date.now() - ONE_WEEK) },
    }).sort({ lastname: 1 });

    if (recentPlayers.length > 0) {
      console.log(
        `Returning ${recentPlayers.length} recent players from cache`
      );
      return res.json(recentPlayers);
    }

    let allPlayers = [];
    let totalRequestsMade = 0;

    // Fetch current season players from RapidAPI NBA
    for (const teamId of teamIds) {
      try {
        // Check if we can make a request based on rate limits
        if (!canMakeRequest()) {
          const delayTime = calculateDelay();
          console.log(`Rate limit reached, waiting for ${delayTime} ms`);
          await delay(delayTime);
        }

        recordRequest();
        totalRequestsMade++;

        const playersResponse = await axios.get(
          "https://api-nba-v1.p.rapidapi.com/players",
          {
            params: {
              team: teamId,
              season: "2024",
            },
            headers: {
              "X-RapidAPI-Key": RAPIDAPI_KEY,
              "X-RapidAPI-Host": RAPIDAPI_HOST,
            },
          }
        );

        if (playersResponse.data && playersResponse.data.response) {
          const teamPlayers = [];

          for (const player of playersResponse.data.response) {
            // Check daily limit
            if (requestsInLastDay.length >= MAX_REQUESTS_PER_DAY - 5) {
              console.log(`Approaching daily limit, skipping remaining players`);
              break;
            }

            // Fetch player stats
            const playerStats = await fetchPlayerStats(player.id);
            totalRequestsMade++;

            const playerWithStats = {
              id: player.id,
              firstname: player.firstname,
              lastname: player.lastname,
              birth: {
                date: player.birth?.date || null,
                country: player.birth?.country || null,
              },
              nba: {
                start: player.nba?.start || null,
                pro: player.nba?.pro || null,
              },
              height: {
                feet: player.height?.feet || null,
                inches: player.height?.inches || null,
                meters: player.height?.meters || null,
              },
              weight: {
                pounds: player.weight?.pounds || null,
                kilograms: player.weight?.kilograms || null,
              },
              college: player.college || null,
              affiliation: player.affiliation || null,
              leagues: {
                standard: {
                  jersey: player.leagues?.standard?.jersey || null,
                  active: player.leagues?.standard?.active || null,
                  pos: player.leagues?.standard?.pos || null,
                },
              },
              stats: playerStats,
              lastUpdated: new Date(), // Set last updated time
            };

            teamPlayers.push(playerWithStats);
          }
          /*const players = playersResponse.data.response.map((player) => ({
            id: player.id,
            firstname: player.firstname,
            lastname: player.lastname,
            birth: {
              date: player.birth?.date || null,
              country: player.birth?.country || null,
            },
            nba: {
              start: player.nba?.start || null,
              pro: player.nba?.pro || null,
            },
            height: {
              feet: player.height?.feet || null,
              inches: player.height?.inches || null,
              meters: player.height?.meters || null,
            },
            weight: {
              pounds: player.weight?.pounds || null,
              kilograms: player.weight?.kilograms || null,
            },
            college: player.college || null,
            affiliation: player.affiliation || null,
            leagues: {
              standard: {
                jersey: player.leagues?.standard?.jersey || null,
                active: player.leagues?.standard?.active || null,
                pos: player.leagues?.standard?.pos || null,
              },
            },
            lastUpdated: new Date(), // Set last updated time
          }));*/

          allPlayers.push(...teamPlayers);
          const teamName = playersResponse.data.response?.[0]?.team?.name || `teamId ${teamId}`;
          console.log(`Fetched ${teamPlayers.length} players with stats for ${teamName}`);
          console.log(`Total API requests made: ${totalRequestsMade}`);

        } else {
          const teamName = playersResponse.data.response?.[0]?.team?.name || `teamId ${teamId}`;
          console.log(`No players found for ${teamName}`);
        }
      } catch (error) {
        console.error(
          `Error fetching players for team ${teamId}:`,
          error.message
        );
      }

      // Check if we are approaching the daily limit for API requests
      if (requestsInLastDay.length >= MAX_REQUESTS_PER_DAY - 10) {
        console.log(`Approaching daily API request limit (${MAX_REQUESTS_PER_DAY - requestsInLastDay.length}) remaining, stopping early`);
        break;
      }

      // Delay between requests
      await delay(calculateDelay());
    }

    console.log(`Processed ${allPlayers.length} players in total, made ${totalRequestsMade} API requests`);

    // Clear old data and save new data in MongoDB
    await Player.deleteMany({});
    await Player.insertMany(allPlayers);

    return res.json(allPlayers);
  } catch (error) {
    console.error("Error fetching players:", error);

    // If API fails, try to return cached data (even if older)
    try {
      const cachedPlayers = await Player.find({}).sort({ lastname: 1 });
      if (cachedPlayers.length > 0) {
        console.log("Returning cached players data");
        return res.json(cachedPlayers);
      }
    } catch (error) {
      console.error("Error fetching cached players:", error);
    }

    return res.status(500).json({
      message: "Error fetching players",
      error: error.message,
    });
  }
};
