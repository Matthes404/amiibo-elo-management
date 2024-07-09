-- server/models/schema.sql
-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Create Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  rating INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Add Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE
);

-- Add Participants Table
CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER,
  user_id INTEGER,
  FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Add Matches Table
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER,
  round INTEGER,
  match_number INTEGER,
  player1_id INTEGER,
  player2_id INTEGER,
  result TEXT,
  FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
  FOREIGN KEY (player1_id) REFERENCES users (id),
  FOREIGN KEY (player2_id) REFERENCES users (id)
);

