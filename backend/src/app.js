const express = require('express');
const healthRoute = require('./routes/health');
const disastersRoute = require('./routes/disasters');
const authRoute = require('./routes/auth');
const dashboardRoute = require('./routes/dashboard');
const vulnerabilityRoute = require('./routes/vulnerability');
const reliefRoute = require('./routes/relief');
const alertsRoute = require('./routes/alerts');
const helpRequestsRoute = require('./routes/helpRequests');
const cors = require('cors');





const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use('/api', healthRoute);
app.use('/api', disastersRoute);
app.use('/api/auth', authRoute);
app.use('/api', dashboardRoute);
app.use('/api', vulnerabilityRoute);
app.use('/api', reliefRoute);
app.use('/api', alertsRoute);
app.use('/api', helpRequestsRoute);

module.exports = app;