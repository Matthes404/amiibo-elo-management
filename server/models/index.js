// backend/models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // SQLite database file path
  define: {
    timestamps: false, // Disable Sequelize's automatic timestamp fields
  },
});

// Import models
const User = require('./user')(sequelize, Sequelize);
const Amiibo = require('./Amiibo')(sequelize, DataTypes);
const Match = require('./Match')(sequelize, Sequelize);
const Tournament = require('./Tournament')(sequelize, Sequelize);
// Import other models similarly (Rating, Tournament, etc.)

// Define associations (if any)
Amiibo.hasMany(Match, { foreignKey: 'amiiboId1', as: 'Match1' });
Amiibo.hasMany(Match, { foreignKey: 'amiiboId2', as: 'Match2' });

Match.belongsTo(Amiibo, { foreignKey: 'amiiboId1', as: 'Amiibo1' });
Match.belongsTo(Amiibo, { foreignKey: 'amiiboId2', as: 'Amiibo2' });

Tournament.hasMany(Match, { as: 'matches', foreignKey: 'tournamentId' });
// Example:
// User.hasMany(Rating);

// Export the Sequelize instance and models
module.exports = {
  sequelize,
  User,
  Amiibo,
  Match,
  Tournament,
  // Export other models here...
};
