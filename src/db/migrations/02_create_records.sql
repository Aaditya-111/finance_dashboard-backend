CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(100) NOT NULL,
  platform VARCHAR(50) DEFAULT 'other'
    CHECK (platform IN ('youtube', 'instagram', 'freelance', 'brand_deal', 'merchandise', 'affiliate', 'other')),
  status VARCHAR(20) DEFAULT 'received'
    CHECK (status IN ('pending', 'received', 'overdue')),
  currency VARCHAR(10) DEFAULT 'INR',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  deleted_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);