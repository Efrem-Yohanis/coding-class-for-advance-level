const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'utility', 'test_data.json');
if (!fs.existsSync(dataPath)) {
  console.error(`ERROR: test data file not found at ${dataPath}`);
  process.exit(2);
}

const raw = fs.readFileSync(dataPath, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('ERROR: failed to parse JSON:', e.message);
  process.exit(2);
}

let missing = [];
for (const [key, entry] of Object.entries(data)) {
  if (entry.uploadFilePath) {
    const candidate = path.join(__dirname, '..', entry.uploadFilePath);
    if (!fs.existsSync(candidate)) {
      missing.push({ key, expected: candidate });
    }
  }
  if (entry.uploadFiles && Array.isArray(entry.uploadFiles)) {
    for (const f of entry.uploadFiles) {
      const candidate = path.join(__dirname, '..', f);
      if (!fs.existsSync(candidate)) {
        missing.push({ key, expected: candidate });
      }
    }
  }
}

if (missing.length === 0) {
  console.log('All uploadFilePath entries point to existing files. ✅');
  process.exit(0);
}

console.warn('Missing upload files:');
for (const m of missing) {
  console.warn(`- ${m.key}: ${m.expected}`);
}
process.exit(1);
