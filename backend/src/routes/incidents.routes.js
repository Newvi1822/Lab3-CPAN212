const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const store = require('../store/incidents.store');
const { validateIncident, validateStatusTransition } = require('../utils/validate');
const { parseCSV, validateCSVRow } = require('../utils/csv');
const config = require('../config/config');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// GET all incidents
router.get('/', (req, res) => {
  try {
    const incidents = store.getAll();
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// GET incident by id
router.get('/:id', (req, res) => {
  try {
    const incident = store.getById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// POST create new incident
router.post('/', (req, res) => {
  try {
    const validation = validateIncident(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const newIncident = store.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      severity: req.body.severity
    });

    res.status(201).json(newIncident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// PATCH update incident status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const incident = store.getById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const transition = validateStatusTransition(incident.status, status);
    if (!transition.isValid) {
      return res.status(400).json({ error: transition.error });
    }

    const updatedIncident = store.updateStatus(req.params.id, status);
    res.json(updatedIncident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update incident status' });
  }
});

// POST bulk upload CSV
router.post('/bulk-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse CSV file
    const rows = await parseCSV(req.file.path);
    
    const validIncidents = [];
    const invalidRows = [];
    const errors = [];

    // Validate each row
    rows.forEach((row, index) => {
      const validation = validateCSVRow(row);
      if (validation.isValid) {
        // Further validate with the same rules as POST /incidents
        const incidentValidation = validateIncident(validation.incident);
        if (incidentValidation.isValid) {
          validIncidents.push(validation.incident);
        } else {
          invalidRows.push(index + 1); // +1 for human-readable row number
          errors.push({ row: index + 1, errors: incidentValidation.errors });
        }
      } else {
        invalidRows.push(index + 1);
        errors.push({ row: index + 1, errors: validation.errors });
      }
    });

    // Create valid incidents
    const result = store.createMany(validIncidents);

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete uploaded file:', err);
    });

    res.json({
      totalRows: rows.length,
      created: result.created.length,
      skipped: invalidRows.length,
      details: {
        invalidRows: errors
      }
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete uploaded file:', err);
      });
    }
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
});

module.exports = router;