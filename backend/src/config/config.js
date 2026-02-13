module.exports = {
  port: process.env.PORT || 3001,
  allowedCategories: ['IT', 'SAFETY', 'FACILITIES', 'OTHER'],
  allowedSeverities: ['LOW', 'MEDIUM', 'HIGH'],
  allowedStatuses: ['OPEN', 'INVESTIGATING', 'RESOLVED'],
  statusTransitions: {
    'OPEN': ['INVESTIGATING'],
    'INVESTIGATING': ['RESOLVED'],
    'RESOLVED': []
  }
};