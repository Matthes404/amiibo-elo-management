// server/routes/dashboard.js
const express = require('express');
const { User, Match } = require('../models');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'].split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'yourSecretKey', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['username', 'eloRating'],
      include: [
        {
          model: Match,
          as: 'Player1Matches',
          include: [{ model: User, as: 'player1', attributes: ['username'] }, { model: User, as: 'player2', attributes: ['username'] }]
        },
        {
          model: Match,
          as: 'Player2Matches',
          include: [{ model: User, as: 'player1', attributes: ['username'] }, { model: User, as: 'player2', attributes: ['username'] }]
        }
      ]
    });

    const matches = [...user.Player1Matches, ...user.Player2Matches];
    res.json({ user, matches });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
