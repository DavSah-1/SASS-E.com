/**
 * ReceiptsAdapter - Interface for receipt processing operations
 * 
 * Supports dual-database architecture:
 * - MySQL for admin users
 * - Supabase for regular users with Row-Level Security (RLS)
 */

/**
 * Receipt data extracted from image
 */
export interface ReceiptData {
  merchant: string;
  amount: number; // In cents
  date: Date;
  category: string;
  categoryId?: number;
  confidence: number; // 0-100
  rawText: string;
  items?: Array<{
    name: string;
    amount: number;
  }>;
  tax?: number;
  tip?: number;
  paymentMethod?: string;
}

export interface ReceiptsAdapter {
  /**
   * Process receipt image and extract transaction data using AI
   */
  processReceiptImage(
    imageUrl: string,
    userId: number
  ): Promise<{ success: boolean; data?: ReceiptData; error?: string }>;

  /**
   * Save receipt image to storage
   */
  saveReceiptImage(
    imageBuffer: Buffer,
    userId: number,
    mimeType: string
  ): Promise<{ success: boolean; url?: string; key?: string; error?: string }>;

  /**
   * Suggest category based on merchant name using AI
   */
  suggestCategory(
    merchantName: string,
    userId: number
  ): Promise<{ category: string; confidence: number }>;

  /**
   * Learn from user corrections to improve future categorization
   */
  learnFromCorrection(
    merchantName: string,
    categoryId: number,
    userId: number
  ): Promise<{ success: boolean }>;

  /**
   * Batch process multiple receipts
   */
  batchProcessReceipts(
    imageUrls: string[],
    userId: number
  ): Promise<{
    success: boolean;
    results: Array<{ url: string; data?: ReceiptData; error?: string }>;
  }>;
}
