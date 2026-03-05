const fs = require('fs');
const path = require('path');

const storagePath = path.join(__dirname, 'storageState.json');
const storage = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));

const token = storage.origins
  .find(o => o.origin === 'http://localhost:4200')
  .localStorage
  .find(item => item.name === 'datashare_token')
  .value;

console.log(token);
