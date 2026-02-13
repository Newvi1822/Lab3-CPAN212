const config = require('../config/config');

const validateIncident = (data) => {
  const errors = [];

  // Check required fields
  if (!data.title) {
    errors.push('Title is required');
  } else if (data.title.length < 5) {
    errors.push('Title must be at least 5 characters long');
  }

  if (!data.description) {
    errors.push('Description is required');
  } else if (data.description.length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!data.category) {
    errors.push('Category is required');
  } else if (!config.allowedCategories.includes(data.category)) {
    errors.push(`Category must be one of: ${config.allowedCategories.join(', ')}`);
  }

  if (!data.severity) {
    errors.push('Severity is required');
  } else if (!config.allowedSeverities.includes(data.severity)) {
    errors.push(`Severity must be one of: ${config.allowedSeverities.join(', ')}`);
  }

  // Validate status if provided
  if (data.status && !config.allowedStatuses.includes(data.status)) {
    errors.push(`Status must be one of: ${config.allowedStatuses.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = config.statusTransitions[currentStatus] || [];
  
  if (!config.allowedStatuses.includes(newStatus)) {
    return {
      isValid: false,
      error: `Invalid status. Must be one of: ${config.allowedStatuses.join(', ')}`
    };
  }

  if (!allowedTransitions.includes(newStatus) && currentStatus !== newStatus) {
    return {
      isValid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`
    };
  }

  return { isValid: true };
};

module.exports = {
  validateIncident,
  validateStatusTransition
};