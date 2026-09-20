const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/dashboard/summary', async (req, res) => {
  const disasters = await prisma.disaster.findMany();

  const totalDisasters = disasters.length;

  const byType = disasters.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const byRegion = disasters.reduce((acc, item) => {
    acc[item.region] = (acc[item.region] || 0) + 1;
    return acc;
  }, {});

  const bySeverity = disasters.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, {});

  const highSeverity = disasters.filter((item) => item.severity === 'High' || item.severity === 'Extreme').length;

  const recentDisasters = disasters
    .slice()
    .sort((a, b) => b.year - a.year)
    .slice(0, 5);

  res.json({
    success: true,
    data: {
      totalDisasters,
      highSeverity,
      byType,
      byRegion,
      bySeverity,
      recentDisasters
    }
  });
});

module.exports = router;