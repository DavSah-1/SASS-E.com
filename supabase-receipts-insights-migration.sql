-- ============================================================================
-- Supabase Migration: Receipts and Financial Insights Tables
-- ============================================================================
-- Execute this in Supabase SQL Editor to create the tables
-- ============================================================================

-- Create receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  transaction_id INTEGER,
  shared_budget_transaction_id INTEGER,
  
  -- Receipt Metadata
  merchant_name VARCHAR(255) NOT NULL,
  merchant_address TEXT,
  merchant_phone VARCHAR(50),
  receipt_date TIMESTAMP NOT NULL,
  receipt_number VARCHAR(100),
  payment_method VARCHAR(50), -- 'cash', 'credit_card', 'debit_card', 'mobile_payment', 'other'
  
  -- Financial Data (in cents)
  subtotal INTEGER,
  tax INTEGER,
  tip INTEGER,
  discount INTEGER,
  total INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Receipt Image & Storage
  image_url VARCHAR(512) NOT NULL,
  thumbnail_url VARCHAR(512),
  file_size INTEGER,
  mime_type VARCHAR(50),
  
  -- OCR Processing
  ocr_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  ocr_provider VARCHAR(50),
  ocr_raw_text TEXT,
  ocr_confidence INTEGER, -- 0-100
  ocr_processed_at TIMESTAMP,
  ocr_error_message TEXT,
  
  -- Categorization
  category_id INTEGER,
  suggested_category VARCHAR(100),
  category_confidence INTEGER, -- 0-100
  
  -- Status & Metadata
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'verified', 'disputed', 'archived'
  notes TEXT,
  tags TEXT, -- JSON array
  is_reimbursable BOOLEAN DEFAULT FALSE,
  reimbursement_status VARCHAR(20), -- 'pending', 'approved', 'rejected', 'paid'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP
);

-- Create indexes for receipts
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_transaction_id ON public.receipts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_receipts_merchant_name ON public.receipts(merchant_name);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON public.receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_receipts_ocr_status ON public.receipts(ocr_status);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON public.receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON public.receipts(created_at);

-- Create receipt_line_items table
CREATE TABLE IF NOT EXISTS public.receipt_line_items (
  id SERIAL PRIMARY KEY,
  receipt_id INTEGER NOT NULL,
  
  -- Item Details
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1000, -- stored as quantity * 1000 (3 decimal places)
  unit_price INTEGER NOT NULL, -- in cents
  total_price INTEGER NOT NULL, -- in cents
  sku VARCHAR(100),
  barcode VARCHAR(100),
  
  -- Categorization
  category_id INTEGER,
  subcategory VARCHAR(100),
  
  -- Metadata
  line_number INTEGER,
  is_refunded BOOLEAN DEFAULT FALSE,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for receipt_line_items
CREATE INDEX IF NOT EXISTS idx_receipt_line_items_receipt_id ON public.receipt_line_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_line_items_category_id ON public.receipt_line_items(category_id);

-- Create financial_insights table
CREATE TABLE IF NOT EXISTS public.financial_insights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  insight_type VARCHAR(50) NOT NULL, -- 'spending_pattern', 'saving_opportunity', 'cash_flow_prediction', 'budget_recommendation', 'trend_analysis'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  actionable BOOLEAN DEFAULT TRUE NOT NULL,
  action_text VARCHAR(255),
  priority VARCHAR(20) DEFAULT 'medium' NOT NULL, -- 'low', 'medium', 'high'
  related_category_id INTEGER,
  data_points TEXT, -- JSON with supporting data
  is_dismissed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP
);

-- Create indexes for financial_insights
CREATE INDEX IF NOT EXISTS idx_financial_insights_user_id ON public.financial_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_insights_insight_type ON public.financial_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_financial_insights_priority ON public.financial_insights(priority);
CREATE INDEX IF NOT EXISTS idx_financial_insights_created_at ON public.financial_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_financial_insights_expires_at ON public.financial_insights(expires_at);

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these to verify tables were created successfully:
--
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('receipts', 'receipt_line_items', 'financial_insights');
-- SELECT * FROM information_schema.columns WHERE table_name IN ('receipts', 'receipt_line_items', 'financial_insights') ORDER BY table_name, ordinal_position;
--
-- ============================================================================
