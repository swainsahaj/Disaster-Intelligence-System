const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const express = require('express');
const router = express.Router();

router.post('/relief-plan',protect, adminOnly,  (req, res) => {
  const {
    affectedPeople,
    severity,
    durationDays = 3
  } = req.body;

  if (!affectedPeople || !severity) {
    return res.status(400).json({
      success: false,
      message: 'affectedPeople and severity are required'
    });
  }

  const people = Number(affectedPeople);
  const days = Number(durationDays);

  if (people <= 0 || days <= 0) {
    return res.status(400).json({
      success: false,
      message: 'affectedPeople and durationDays must be positive numbers'
    });
  }

  const severityMultiplier = {
    Low: 1,
    Medium: 1.25,
    High: 1.5,
    Extreme: 2
  };

  const multiplier = severityMultiplier[severity];

  if (!multiplier) {
    return res.status(400).json({
      success: false,
      message: 'Severity must be Low, Medium, High, or Extreme'
    });
  }

  const adjustedPeople = Math.ceil(people * multiplier);

  const plan = {
    shelters: Math.ceil(adjustedPeople / 100),
    foodPackets: adjustedPeople * days,
    waterLiters: adjustedPeople * days * 3,
    medicalKits: Math.ceil(adjustedPeople / 50),
    rescueTeams: Math.max(1, Math.ceil(adjustedPeople / 500)),
    volunteers: Math.ceil(adjustedPeople / 20)
  };

  res.json({
    success: true,
    data: {
      affectedPeople: people,
      severity,
      durationDays: days,
      adjustedPeople,
      plan
    }
  });
});

module.exports = router;