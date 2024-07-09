// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes/routes.js');
const { sequelize } = require('./models'); 

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Use routes from /routes/routes.js
app.use('/api', routes);

// Initialize SQLite database (assuming sequelize is used)
sequelize.sync() // This will sync your Sequelize models with the database
    .then(() => {
        console.log('Database synced');
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
