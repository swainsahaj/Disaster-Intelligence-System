const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/disasters', async (req, res) => {
  const { region, type, severity, year } = req.query;

  const filters = {};

  if (region) filters.region = region;
  if (type) filters.type = type;
  if (severity) filters.severity = severity;
  if (year) filters.year = Number(year);

  const disasters = await prisma.disaster.findMany({
    where: filters
  });

  res.json({
    success: true,
    count: disasters.length,
    data: disasters
  });
});

router.get('/disasters/:id', async (req, res) => {
  const id = Number(req.params.id);

  const disaster = await prisma.disaster.findUnique({
    where: { id }
  });

  if (!disaster) {
    return res.status(404).json({
      success: false,
      message: 'Disaster not found'
    });
  }

  res.json({
    success: true,
    data: disaster
  });
});

router.post('/disasters', protect, adminOnly, async (req, res) => {
  const { name, type, severity, region, year } = req.body;

  if (!name || !type || !severity || !region || !year) {
    return res.status(400).json({
      success: false,
      message: 'Name, type, severity, region, and year are required'
    });
  }

  const newDisaster = await prisma.disaster.create({
    data: {
      name,
      type,
      severity,
      region,
      year
    }
  });

  res.status(201).json({
    success: true,
    data: newDisaster
  });
});

router.put('/disasters/:id', protect, adminOnly, async (req, res) => {
  const id = Number(req.params.id);

  const disaster = await prisma.disaster.findUnique({
    where: { id }
  });

  if (!disaster) {
    return res.status(404).json({
      success: false,
      message: 'Disaster not found'
    });
  }

  const updatedDisaster = await prisma.disaster.update({
    where: { id },
    data: req.body
  });

  res.json({
    success: true,
    data: updatedDisaster
  });
});

router.delete('/disasters/:id', protect, adminOnly, async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.disaster.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Disaster deleted successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Disaster not found'
    });
  }
});

module.exports = router;