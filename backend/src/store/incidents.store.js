const { v4: uuidv4 } = require('uuid');

// In-memory store
let incidents = [];

const store = {
  // Get all incidents
  getAll: () => {
    return [...incidents];
  },

  // Get incident by id
  getById: (id) => {
    return incidents.find(incident => incident.id === id);
  },

  // Create new incident
  create: (incidentData) => {
    const newIncident = {
      id: uuidv4(),
      ...incidentData,
      status: 'OPEN',
      reportedAt: new Date().toISOString()
    };
    incidents.push(newIncident);
    return newIncident;
  },

  // Update incident status
  updateStatus: (id, newStatus) => {
    const incident = incidents.find(inc => inc.id === id);
    if (incident) {
      incident.status = newStatus;
      return incident;
    }
    return null;
  },

  // Create multiple incidents (for bulk upload)
  createMany: (incidentsData) => {
    const created = [];
    const skipped = [];
    
    incidentsData.forEach((data, index) => {
      try {
        const newIncident = {
          id: uuidv4(),
          ...data,
          status: data.status || 'OPEN',
          reportedAt: new Date().toISOString()
        };
        incidents.push(newIncident);
        created.push(newIncident);
      } catch (error) {
        skipped.push(index);
      }
    });
    
    return { created, skipped };
  },

  // Clear store (for testing)
  clear: () => {
    incidents = [];
  }
};

module.exports = store;