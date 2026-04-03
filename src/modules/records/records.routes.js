const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authentication');
const { authorize } = require('../../middlewares/authorization');
const {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord
} = require('./records.controller');

router.use(authenticate);

router.get('/', authorize('records:read'), getRecords);
router.get('/:id', authorize('records:read'), getRecordById);

router.post('/', authorize('records:write'), createRecord);
router.put('/:id', authorize('records:write'), updateRecord);

router.delete('/:id', authorize('records:delete'), deleteRecord);

module.exports = router;