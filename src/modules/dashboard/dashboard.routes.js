const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authentication');
const { authorize } = require('../../middlewares/authorization');
const {
  getSummary, getTaxEstimate, getCategoryTotals,
  getPlatformBreakdown, getMonthlyTrends,
  getRecentActivity, getTopCategories
} = require('./dashboard.controller');

router.use(authenticate);

router.get('/summary', authorize('dashboard:read'), getSummary);
router.get('/tax-estimate', authorize('dashboard:read'), getTaxEstimate);
router.get('/by-category', authorize('dashboard:read'), getCategoryTotals);
router.get('/by-platform', authorize('dashboard:read'), getPlatformBreakdown);
router.get('/trends', authorize('dashboard:read'), getMonthlyTrends);
router.get('/recent', authorize('dashboard:read'), getRecentActivity);
router.get('/top-categories', authorize('dashboard:read'), getTopCategories);

module.exports = router;