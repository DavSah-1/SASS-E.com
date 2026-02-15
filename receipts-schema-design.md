# Receipts Table Schema Design

## Overview
Comprehensive receipt storage system with OCR data, line items, and metadata.

## Main Table: `receipts`

### Core Fields
- `id` - INT AUTO_INCREMENT PRIMARY KEY
- `userId` - INT NOT NULL (foreign key to users)
- `transactionId` - INT (optional link to budget_transactions)
- `sharedBudgetTransactionId` - INT (optional link to shared_budget_transactions)

### Receipt Metadata
- `merchantName` - VARCHAR(255) NOT NULL
- `merchantAddress` - TEXT
- `merchantPhone` - VARCHAR(50)
- `receiptDate` - TIMESTAMP NOT NULL
- `receiptNumber` - VARCHAR(100)
- `paymentMethod` - ENUM('cash', 'credit_card', 'debit_card', 'mobile_payment', 'other')

### Financial Data
- `subtotal` - DECIMAL(10, 2)
- `tax` - DECIMAL(10, 2)
- `tip` - DECIMAL(10, 2)
- `discount` - DECIMAL(10, 2)
- `total` - DECIMAL(10, 2) NOT NULL
- `currency` - VARCHAR(3) DEFAULT 'USD'

### Receipt Image & Storage
- `imageUrl` - VARCHAR(512) NOT NULL (S3 URL)
- `thumbnailUrl` - VARCHAR(512)
- `fileSize` - INT (in bytes)
- `mimeType` - VARCHAR(50)

### OCR Processing
- `ocrStatus` - ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending'
- `ocrProvider` - VARCHAR(50) (e.g., 'google_vision', 'aws_textract', 'azure_ocr')
- `ocrRawText` - TEXT (full extracted text)
- `ocrConfidence` - DECIMAL(5, 2) (0-100 confidence score)
- `ocrProcessedAt` - TIMESTAMP
- `ocrErrorMessage` - TEXT

### Categorization
- `categoryId` - INT (link to budget_categories)
- `suggestedCategory` - VARCHAR(100) (AI-suggested category)
- `categoryConfidence` - DECIMAL(5, 2)

### Status & Metadata
- `status` - ENUM('draft', 'verified', 'disputed', 'archived') DEFAULT 'draft'
- `notes` - TEXT
- `tags` - TEXT (JSON array of tags)
- `isReimbursable` - BOOLEAN DEFAULT FALSE
- `reimbursementStatus` - ENUM('pending', 'approved', 'rejected', 'paid')

### Timestamps
- `createdAt` - TIMESTAMP DEFAULT NOW()
- `updatedAt` - TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
- `verifiedAt` - TIMESTAMP

## Child Table: `receipt_line_items`

### Core Fields
- `id` - INT AUTO_INCREMENT PRIMARY KEY
- `receiptId` - INT NOT NULL (foreign key to receipts)

### Item Details
- `itemName` - VARCHAR(255) NOT NULL
- `itemDescription` - TEXT
- `quantity` - DECIMAL(10, 3) DEFAULT 1
- `unitPrice` - DECIMAL(10, 2) NOT NULL
- `totalPrice` - DECIMAL(10, 2) NOT NULL
- `sku` - VARCHAR(100)
- `barcode` - VARCHAR(100)

### Categorization
- `categoryId` - INT
- `subcategory` - VARCHAR(100)

### Metadata
- `lineNumber` - INT (order in receipt)
- `isRefunded` - BOOLEAN DEFAULT FALSE
- `notes` - TEXT

### Timestamps
- `createdAt` - TIMESTAMP DEFAULT NOW()

## Indexes

### receipts table
- `idx_receipts_user_id` ON userId
- `idx_receipts_transaction_id` ON transactionId
- `idx_receipts_merchant_name` ON merchantName
- `idx_receipts_receipt_date` ON receiptDate
- `idx_receipts_ocr_status` ON ocrStatus
- `idx_receipts_status` ON status
- `idx_receipts_created_at` ON createdAt

### receipt_line_items table
- `idx_receipt_line_items_receipt_id` ON receiptId
- `idx_receipt_line_items_category_id` ON categoryId

## RLS Policies (Supabase)

### receipts
1. Users can view their own receipts
2. Users can view receipts linked to shared budgets they're members of
3. Users can create receipts for themselves
4. Users can update their own receipts
5. Users can delete their own receipts

### receipt_line_items
1. Users can view line items for receipts they have access to
2. Users can create line items for their own receipts
3. Users can update line items for their own receipts
4. Users can delete line items for their own receipts

## Use Cases

1. **Upload Receipt**: User uploads image → OCR processing → extract data → create receipt + line items
2. **Link to Transaction**: Associate receipt with existing budget transaction
3. **Expense Reimbursement**: Mark receipt as reimbursable, track approval status
4. **Search & Filter**: Find receipts by merchant, date range, category, amount
5. **Analytics**: Generate spending reports by merchant, category, time period
6. **Tax Preparation**: Export receipts for specific categories/date ranges

## Migration Strategy

1. Create both tables in MySQL (drizzle/schema.ts)
2. Create both tables in Supabase (drizzle/supabaseSchema.ts)
3. Run migrations: `pnpm db:push`
4. Apply RLS policies in Supabase
5. Update ReceiptsAdapter to use new tables
6. Update receipts.ts helper functions
7. Create tRPC procedures for receipt management
