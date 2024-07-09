// backend/models/Amiibo.js
const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
const Amiibo = sequelize.define('Amiibo', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  elo: {
    type: DataTypes.INTEGER,
    defaultValue: 1000,
  },
  tournamentwins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  title: {
    type: DataTypes.ENUM(['-', 'FM', 'IM', 'GM']),
    defaultValue: '-'
  },
  highestElo: {
    type: DataTypes.INTEGER,
    defaultValue: 1000, // Initial value
  },
}, {
  tableName: 'Amiibos',
  hooks: {
    afterSave: async (amiibo) => {
      if (amiibo.elo > amiibo.highestElo) {
        // Update highestElo and potentially update title
        await amiibo.update({
          highestElo: amiibo.elo
        });
      await amiibo.update({  
      title: determineTitle(amiibo.highestElo)
      });
        
      }
    },
  },
});
    // Function to determine title based on Elo
    const determineTitle = (elo) => {
      if (elo >= 1500) {
        return 'GM';
      } else if (elo >= 1400) {
        return 'IM';
      } else if (elo >= 1300) {
        return 'FM';
      } else {
        return '-';
      }
    };
    return Amiibo;
}

