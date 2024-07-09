// backend/routes/routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Amiibo, Match, Tournament } = require('../models'); // Import Sequelize models
const router = express.Router();



// Helperfunctions

const generateMatches = async (tournamentId, amiiboIds, type) => {
  switch (type) {
    case 'Round-Robin':
      for (let i = 0; i < amiiboIds.length; i++) {
        for (let j = i + 1; j < amiiboIds.length; j++) {
          await Match.create({
            amiiboId1: amiiboIds[i],
            amiiboId2: amiiboIds[j],
            tournamentId,
          });
        }
      }
      break;

    case 'K.O.':
      // Generate knockout matches (simplified for the first round)
      for (let i = 0; i < amiiboIds.length; i += 2) {
        if (amiiboIds[i + 1]) {
          await Match.create({
            amiiboId1: amiiboIds[i],
            amiiboId2: amiiboIds[i + 1],
            tournamentId,
          });
        }
      }
      break;

    // Add logic for other types like Double K.O., Swiss, etc.

    default:
      throw new Error('Unsupported tournament type');
  }
};


function calculateExpectedScore(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }
  


// Route for user registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({ username, password: hashedPassword });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Route for user login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, 'yourSecretKey', { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route for adding a new player
router.post('/addPlayer', async (req, res) => {
    const { name, elo } = req.body; // Assuming your form sends 'name'
    let newPlayer;

    try {
      // Check if the player already exists
      const existingPlayer = await Amiibo.findOne({ where: { name } });
      if (existingPlayer) {
        return res.status(400).json({ message: 'Player already exists' });
      }

      // Create a new player with default Elo of 1000
      if (elo == '') {
         newPlayer = await Amiibo.create({ name });
      } else {
         newPlayer = await Amiibo.create({ name, elo });
      }

  
      res.status(201).json({ message: 'Player added successfully', player: newPlayer });
    } catch (error) {
      console.error('Error adding player:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Route to fetch all players
router.get('/amiibos', async (req, res) => {
    try {
      const players = await Amiibo.findAll({
        attributes: ['id', 'name', 'elo', 'title', 'highestElo'], // Specify attributes to fetch
        order: [['elo', 'DESC']] // Order players by Elo descending (or as needed)
      });
  
      res.json(players);
    } catch (error) {
      console.error('Error fetching players:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });


    // Route to fetch best 10 players
router.get('/highestamiibos', async (req, res) => {
  try {
    const players = await Amiibo.findAll({
      attributes: ['id', 'name', 'highestElo', ['highestElo', 'elo'], 'title'], // Specify attributes to fetch
      order: [['highestElo', 'DESC']], // Order players by Elo descending (or as needed)
      limit: 10,
      offset: 0
    });

    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Route to create a match between two Amiibos
router.post('/createMatch', async (req, res) => {
    const { amiiboId1, amiiboId2 } = req.body;
  
    try {
      // Check if both Amiibos exist
      const amiibo1 = await Amiibo.findByPk(amiiboId1);
      const amiibo2 = await Amiibo.findByPk(amiiboId2);
  
      if (!amiibo1 || !amiibo2) {
        return res.status(404).json({ message: 'One or both Amiibos not found' });
      }
  
      // Create the match
      const newMatch = await Match.create({
        amiiboId1,
        amiiboId2,
      });
  
      res.status(201).json({ message: 'Match created successfully', match: newMatch });
    } catch (error) {
      console.error('Error creating match:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

// Route to fetch all matches with Amiibo names
router.get('/matches', async (req, res) => {
    try {
      const matches = await Match.findAll({
        include: [
          { model: Amiibo, as: 'Amiibo1', attributes: ['name'] },
          { model: Amiibo, as: 'Amiibo2', attributes: ['name'] },
        ],
      });
      res.json(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
// Assuming you have Amiibo and Match models defined with associations

router.put('/matches/:id', async (req, res) => {
    const { winnerId } = req.body;
  
    try {
      const match = await Match.findByPk(req.params.id);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      if (match.locked) {
        return res.status(400).json({ message: 'Match is already locked' });
      }
  
      // Get Amiibos for the match
      const amiibo1 = await Amiibo.findByPk(match.amiiboId1);
      const amiibo2 = await Amiibo.findByPk(match.amiiboId2);
  
      if (!amiibo1 || !amiibo2) {
        return res.status(404).json({ error: 'Amiibo not found' });
      }

      match.winnerId = winnerId;
      match.locked = true;
      await match.save();
  
      // Calculate expected scores
      const expectedScoreA = calculateExpectedScore(amiibo1.elo, amiibo2.elo);
      const expectedScoreB = 1 - expectedScoreA;
  
      // Determine actual score (1 for winner, 0 for loser)
      const actualScoreA = winnerId === match.amiiboId1 ? 1 : 0;
      const actualScoreB = 1 - actualScoreA;
  
      // Update Elo ratings
      const K = 32; // Example K-factor, adjust as needed
  
      const deltaEloA = Math.round(K * (actualScoreA - expectedScoreA));
      const deltaEloB = Math.round(K * (actualScoreB - expectedScoreB));
  
      amiibo1.elo += deltaEloA;
      amiibo2.elo += deltaEloB;
  
      await amiibo1.save();
      await amiibo2.save();
  
      res.json({ message: 'Match result updated successfully', match });
    } catch (error) {
      console.error('Error updating match result:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });


// Create a new tournament
router.post('/tournaments', async (req, res) => {
  const { name, type, amiiboIds } = req.body;

  try {
    const tournament = await Tournament.create({ name, type });

    // Generate matches based on tournament type
    await generateMatches(tournament.id, amiiboIds, type);

    res.status(201).json({ message: 'Tournament created successfully', tournament });
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all tournaments with matches
router.get('/tournaments', async (req, res) => {
  try {
    const tournaments = await Tournament.findAll({
      include: [
        {
          model: Match,
          as: 'matches', // Use the alias defined in Tournament.hasMany(Match, { as: 'matches' })
          include: [
            { model: Amiibo, as: 'Amiibo1' }, // Include Amiibo details for match.amiiboId1
            { model: Amiibo, as: 'Amiibo2' }, // Include Amiibo details for match.amiiboId2
          ],
        },
      ],
    });

    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Fetch tournament by ID with related matches and amiibos
router.get('/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id, {
      include: [
        {
          model: Match,
          as: 'matches', // Specify the alias defined in Tournament.hasMany(Match, { as: 'matches' })
          include: [
            { model: Amiibo, as: 'Amiibo1' }, // Include Amiibo details for match.amiiboId1
            { model: Amiibo, as: 'Amiibo2' }, // Include Amiibo details for match.amiiboId2
          ],
        },
      ],
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Server error' });
  }
});




// Additional routes for tournaments, participants, matches, etc.

module.exports = router;
