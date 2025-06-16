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

    // Fetch current season players from RapidAPI NBA
    for (const teamId of teamIds) {
      try {
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
          const players = playersResponse.data.response.map((player) => ({
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
          }));

          allPlayers.push(...players);
          const teamName = playersResponse.data.response?.[0]?.team?.name || `teamId ${teamId}`;
          console.log(`Fetched ${players.length} players for ${teamName}`);

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

      // Delay between requests
      await delay(6500); // 6.5 second delay to avoid hitting rate limits
    }

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
