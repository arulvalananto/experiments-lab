const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'agents.db');
const db = new sqlite3.Database(dbPath);

// Create tables if not exist
function init() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      task TEXT NOT NULL,
      system_prompt TEXT,
      cron TEXT NOT NULL,
      email TEXT,
      enabled INTEGER DEFAULT 1,
      timeout INTEGER DEFAULT 60,
      max_retries INTEGER DEFAULT 3,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
        db.run(`CREATE TABLE IF NOT EXISTS executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER,
      status TEXT,
      response TEXT,
      error TEXT,
      started_at DATETIME,
      finished_at DATETIME,
      retries INTEGER,
      duration INTEGER,
      FOREIGN KEY(agent_id) REFERENCES agents(id)
    )`);
    });
}

module.exports = {
    db,
    init,
};
