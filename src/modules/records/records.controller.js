const asyncHandler = require('../../utils/asyncHandler');
const recordsService = require('./records.service');
const { createRecordSchema, updateRecordSchema } = require('./records.validation');
const ApiError = require('../../utils/ApiError');

const createRecord = asyncHandler(async (req, res) => {
  const parsed = createRecordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(422, parsed.error.errors[0].message);
  }
  const record = await recordsService.createRecord(req.user.id, parsed.data);
  res.status(201).json({ success: true, message: 'Record created successfully', data: record });
});

const getRecords = asyncHandler(async (req, res) => {
  const records = await recordsService.getRecords(req.user.id, req.query);
  res.status(200).json({ success: true, count: records.length, data: records });
});

const getRecordById = asyncHandler(async (req, res) => {
  const record = await recordsService.getRecordById(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: record });
});

const updateRecord = asyncHandler(async (req, res) => {
  const parsed = updateRecordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(422, parsed.error.errors[0].message);
  }
  const record = await recordsService.updateRecord(req.user.id, req.params.id, parsed.data);
  res.status(200).json({ success: true, message: 'Record updated successfully', data: record });
});

const deleteRecord = asyncHandler(async (req, res) => {
  const result = await recordsService.deleteRecord(req.user.id, req.params.id);
  res.status(200).json({ success: true, message: result.message });
});

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };