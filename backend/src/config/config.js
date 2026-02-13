const path = require('path');

module.exports = {
  port: process.env.PORT || 3001,
  
  // File path for JSON storage
  dataPath: path.join(__dirname, '../../data/incidents.json'),
  
  // Allowed values
  allowedCategories: ['IT', 'SAFETY', 'FACILITIES', 'OTHER'],
  allowedSeverities: ['LOW', 'MEDIUM', 'HIGH'],
  allowedStatuses: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'ARCHIVED'],
  
  // Status transition rules
  statusTransitions: {
    'OPEN': ['INVESTIGATING', 'ARCHIVED'],
    'INVESTIGATING': ['RESOLVED'],
    'RESOLVED': ['ARCHIVED'],
    'ARCHIVED': ['OPEN']
  },
  
  // Display settings
  defaultHideArchived: true
};