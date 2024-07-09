// backend/models/Match.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Match = sequelize.define('Match', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    amiiboId1: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amiiboId2: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    winnerId: {
      type: DataTypes.INTEGER,
    },
    locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    tournamentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Tournaments',
        key: 'id'
      },
    },
  });

  return Match;
};
