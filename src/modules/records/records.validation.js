const { z } = require('zod');

const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type must be income or expense' })
  }),
  category: z.string().min(1, 'Category is required'),
  platform: z.enum([
    'youtube', 'instagram', 'freelance',
    'brand_deal', 'merchandise', 'affiliate', 'other'
  ]).default('other'),
  status: z.enum(['pending', 'received', 'overdue']).default('received'),
  currency: z.string().default('INR'),
  date: z.string().optional(),
  notes: z.string().optional()
});

const updateRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().min(1).optional(),
  platform: z.enum([
    'youtube', 'instagram', 'freelance',
    'brand_deal', 'merchandise', 'affiliate', 'other'
  ]).optional(),
  status: z.enum(['pending', 'received', 'overdue']).optional(),
  currency: z.string().optional(),
  date: z.string().optional(),
  notes: z.string().optional()
});

module.exports = { createRecordSchema, updateRecordSchema };