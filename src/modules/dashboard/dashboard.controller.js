const asyncHandler = require('../../utils/asyncHandler');
const dashboardService = require('./dashboard.service');

const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary(req.user.id);
  res.status(200).json({ success: true, data });
});

const getCategoryTotals = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCategoryTotals(req.user.id);
  res.status(200).json({ success: true, data });
});

const getMonthlyTrends = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMonthlyTrends(req.user.id);
  res.status(200).json({ success: true, data });
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRecentActivity(req.user.id);
  res.status(200).json({ success: true, data });
});

module.exports = { getSummary, getCategoryTotals, getMonthlyTrends, getRecentActivity };