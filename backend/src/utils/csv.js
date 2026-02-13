const fs = require('fs');
const csv = require('csv-parse');

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv.parse({ columns: true, trim: true }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

const validateCSVRow = (row) => {
  // Map CSV columns to incident fields
  const incident = {
    title: row.title || row.Title,
    description: row.description || row.Description,
    category: row.category || row.Category,
    severity: row.severity || row.Severity,
    status: row.status || row.Status || 'OPEN'
  };

  // Check if required fields exist
  const missingFields = [];
  if (!incident.title) missingFields.push('title');
  if (!incident.description) missingFields.push('description');
  if (!incident.category) missingFields.push('category');
  if (!incident.severity) missingFields.push('severity');

  if (missingFields.length > 0) {
    return {
      isValid: false,
      incident: null,
      errors: [`Missing required fields: ${missingFields.join(', ')}`]
    };
  }

  return {
    isValid: true,
    incident,
    errors: []
  };
};

module.exports = {
  parseCSV,
  validateCSVRow
};