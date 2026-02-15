/**
 * MySQLReceiptsAdapter - MySQL implementation for receipt processing operations
 * 
 * Used for admin users. Delegates to server/db/receipts.ts functions.
 */

import { ReceiptsAdapter, ReceiptData } from "./ReceiptsAdapter";
import * as receiptsDb from "../db/receipts";

export class MySQLReceiptsAdapter implements ReceiptsAdapter {
  async processReceiptImage(
    imageUrl: string,
    userId: number
  ): Promise<{ success: boolean; data?: ReceiptData; error?: string }> {
    return receiptsDb.processReceiptImage(imageUrl, userId);
  }

  async saveReceiptImage(
    imageBuffer: Buffer,
    userId: number,
    mimeType: string
  ): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
    return receiptsDb.saveReceiptImage(imageBuffer, userId, mimeType);
  }

  async suggestCategory(
    merchantName: string,
    userId: number
  ): Promise<{ category: string; confidence: number }> {
    return receiptsDb.suggestCategory(merchantName, userId);
  }

  async learnFromCorrection(
    merchantName: string,
    categoryId: number,
    userId: number
  ): Promise<{ success: boolean }> {
    return receiptsDb.learnFromCorrection(merchantName, categoryId, userId);
  }

  async batchProcessReceipts(
    imageUrls: string[],
    userId: number
  ): Promise<{
    success: boolean;
    results: Array<{ url: string; data?: ReceiptData; error?: string }>;
  }> {
    return receiptsDb.batchProcessReceipts(imageUrls, userId);
  }
}
