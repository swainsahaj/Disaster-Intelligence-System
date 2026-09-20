const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/alerts', async (req, res) => {
  const { region, severity } = req.query;

  const where = {
    active: true
  };

  if (region) where.region = region;
  if (severity) where.severity = severity;

  const alerts = await prisma.alert.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    count: alerts.length,
    data: alerts
  });
});

router.post('/alerts', protect, adminOnly, async (req, res) => {
  const { title, message, region, severity } = req.body;

  if (!title || !message || !region || !severity) {
    return res.status(400).json({
      success: false,
      message: 'Title, message, region, and severity are required'
    });
  }

  const alert = await prisma.alert.create({
    data: {
      title,
      message,
      region,
      severity
    }
  });

  res.status(201).json({
    success: true,
    data: alert
  });
});

router.patch('/alerts/:id/deactivate', protect, adminOnly, async (req, res) => {
  const id = Number(req.params.id);

  const alert = await prisma.alert.updateMany({
    where: { id },
    data: { active: false }
  });

  if (alert.count === 0) {
    return res.status(404).json({
      success: false,
      message: 'Alert not found'
    });
  }

  res.json({
    success: true,
    message: 'Alert deactivated successfully'
  });
});

module.exports = router;