const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../utils/fileStorage');

const store = {
  // Get all incidents (with optional archived filter)
  getAll: async (includeArchived = false) => {
    const incidents = await readData();
    if (!includeArchived) {
      return incidents.filter(i => i.status !== 'ARCHIVED');
    }
    return incidents;
  },

  // Get incident by id
  getById: async (id) => {
    const incidents = await readData();
    return incidents.find(incident => incident.id === id);
  },

  // Create new incident
  create: async (incidentData) => {
    const incidents = await readData();
    const newIncident = {
      id: uuidv4(),
      ...incidentData,
      status: 'OPEN',
      reportedAt: new Date().toISOString()
    };
    incidents.push(newIncident);
    await writeData(incidents);
    return newIncident;
  },

  // Update incident status
  updateStatus: async (id, newStatus) => {
    const incidents = await readData();
    const incident = incidents.find(inc => inc.id === id);
    if (incident) {
      incident.status = newStatus;
      await writeData(incidents);
      return incident;
    }
    return null;
  },

  // Create multiple incidents (for bulk upload)
  createMany: async (incidentsData) => {
    const incidents = await readData();
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
    
    await writeData(incidents);
    return { created, skipped };
  },

  // Archive incident (helper method)
  archive: async (id) => {
    return store.updateStatus(id, 'ARCHIVED');
  },

  // Restore from archive (helper method)
  restore: async (id) => {
    return store.updateStatus(id, 'OPEN');
  },

  // Clear store (for testing)
  clear: async () => {
    await writeData([]);
  }
};

module.exports = store;