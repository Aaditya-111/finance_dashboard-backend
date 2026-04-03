const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authentication');
const { authorize } = require('../../middlewares/authorization');
const {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity
} = require('./dashboard.controller');

router.use(authenticate);

router.get('/summary', authorize('dashboard:read'), getSummary);
router.get('/by-category', authorize('dashboard:read'), getCategoryTotals);
router.get('/trends', authorize('dashboard:read'), getMonthlyTrends);
router.get('/recent', authorize('dashboard:read'), getRecentActivity);

module.exports = router;