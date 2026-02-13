const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(config.dataPath);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read incidents from JSON file
async function readData() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(config.dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Write incidents to JSON file
async function writeData(data) {
  await ensureDataDir();
  await fs.writeFile(config.dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  readData,
  writeData
};