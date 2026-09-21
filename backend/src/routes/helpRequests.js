const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.post('/help-requests', protect, async (req, res) => {
  const {
    requestType,
    description,
    region,
    phone
  } = req.body;

  if (!requestType || !description || !region || !phone) {
    return res.status(400).json({
      success: false,
      message: 'requestType, description, region, and phone are required'
    });
  }

  const helpRequest = await prisma.helpRequest.create({
    data: {
      userId: req.user.id,
      requestType,
      description,
      region,
      phone
    }
  });

  res.status(201).json({
    success: true,
    data: helpRequest
  });
});

router.get('/help-requests', protect, adminOnly, async (req, res) => {
  const { status, region } = req.query;

  const where = {};

  if (status) where.status = status;
  if (region) where.region = region;

  const helpRequests = await prisma.helpRequest.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    count: helpRequests.length,
    data: helpRequests
  });
});

router.patch('/help-requests/:id/status', protect, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const allowedStatuses = [
    'pending',
    'in_progress',
    'resolved',
    'rejected'
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  let helpRequest;

  try {
    helpRequest = await prisma.helpRequest.update({
      where: { id },
      data: { status }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Help request not found'
      });
    }

    throw error;
  }

  res.json({
    success: true,
    message: 'Help request status updated',
    data: helpRequest
  });
});

router.get('/my-help-requests', protect, async (req, res) => {
  const helpRequests = await prisma.helpRequest.findMany({
    where: {
      userId: req.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    count: helpRequests.length,
    data: helpRequests
  });
});

module.exports = router;