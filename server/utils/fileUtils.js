const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Read JSON file
const readJsonFile = async (filename) => {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
};

// Write JSON file
const writeJsonFile = async (filename, data) => {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Add item to JSON file
const addToJsonFile = async (filename, item) => {
  const data = await readJsonFile(filename);
  const newItem = {
    id: uuidv4(),
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.push(newItem);
  await writeJsonFile(filename, data);
  return newItem;
};

// Update item in JSON file
const updateInJsonFile = async (filename, id, updates) => {
  const data = await readJsonFile(filename);
  const index = data.findIndex(item => item.id === id);
  
  if (index === -1) {
    throw new Error('Item not found');
  }
  
  data[index] = {
    ...data[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await writeJsonFile(filename, data);
  return data[index];
};

// Delete item from JSON file
const deleteFromJsonFile = async (filename, id) => {
  const data = await readJsonFile(filename);
  const filteredData = data.filter(item => item.id !== id);
  
  if (data.length === filteredData.length) {
    throw new Error('Item not found');
  }
  
  await writeJsonFile(filename, filteredData);
  return true;
};

// Find item in JSON file
const findInJsonFile = async (filename, predicate) => {
  const data = await readJsonFile(filename);
  return data.find(predicate);
};

// Filter items in JSON file
const filterInJsonFile = async (filename, predicate) => {
  const data = await readJsonFile(filename);
  return data.filter(predicate);
};

module.exports = {
  readJsonFile,
  writeJsonFile,
  addToJsonFile,
  updateInJsonFile,
  deleteFromJsonFile,
  findInJsonFile,
  filterInJsonFile
};