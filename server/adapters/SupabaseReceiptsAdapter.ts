/**
 * SupabaseReceiptsAdapter - Supabase implementation for receipt processing operations
 * 
 * Used for regular users. Enforces Row-Level Security (RLS) at database level.
 * 
 * Note: This adapter uses the LLM service and storage service which are available server-side.
 */

import { ReceiptsAdapter, ReceiptData } from "./ReceiptsAdapter";
import { getSupabaseClient } from "../supabaseClient";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseReceiptsAdapter implements ReceiptsAdapter {
  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient(): Promise<SupabaseClient> {
    return getSupabaseClient(this.accessToken);
  }

  async processReceiptImage(
    imageUrl: string,
    userId: number
  ): Promise<{ success: boolean; data?: ReceiptData; error?: string }> {
    try {
      const client = await this.getClient();

      // Get user's budget categories for better categorization
      const { data: userCategories } = await client
        .from("budget_categories")
        .select("name")
        .eq("user_id", userId);

      const categories = userCategories?.map(c => c.name) || [];

      // Use LLM with vision to analyze the receipt
      const prompt = `Analyze this receipt image and extract the following information in JSON format:

{
  "merchant": "Name of the store/restaurant",
  "amount": total amount in cents (e.g., $45.99 = 4599),
  "date": "YYYY-MM-DD format",
  "category": "Best matching category from this list: ${categories.length > 0 ? categories.join(", ") : "Food & Dining, Shopping, Transportation, Entertainment, Healthcare, Utilities, Other"}",
  "confidence": confidence score 0-100,
  "items": [{"name": "item name", "amount": amount in cents}] (optional, only if clearly visible),
  "tax": tax amount in cents (optional),
  "tip": tip amount in cents (optional),
  "paymentMethod": "cash/card/digital" (optional)
}

Important:
- Extract the TOTAL amount (including tax and tip if present)
- Use today's date if receipt date is unclear
- Choose the most appropriate category based on merchant name
- Set confidence to 90+ if all fields are clearly visible, 70-89 if some fields are unclear, below 70 if very unclear`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a receipt parsing assistant. Extract structured data from receipt images accurately.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high",
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("No content in LLM response");
      }

      const parsed = JSON.parse(content);

      // Find category ID if available
      let categoryId: number | undefined;
      if (parsed.category) {
        const { data: matchedCategory } = await client
          .from("budget_categories")
          .select("id")
          .eq("name", parsed.category)
          .limit(1)
          .single();

        if (matchedCategory) {
          categoryId = matchedCategory.id;
        }
      }

      const receiptData: ReceiptData = {
        merchant: parsed.merchant || "Unknown Merchant",
        amount: parsed.amount || 0,
        date: parsed.date ? new Date(parsed.date) : new Date(),
        category: parsed.category || "Other",
        categoryId,
        confidence: parsed.confidence || 50,
        rawText: content,
        items: parsed.items,
        tax: parsed.tax,
        tip: parsed.tip,
        paymentMethod: parsed.paymentMethod,
      };

      return { success: true, data: receiptData };
    } catch (error) {
      console.error("[SupabaseReceiptsAdapter] processReceiptImage error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process receipt",
      };
    }
  }

  async saveReceiptImage(
    imageBuffer: Buffer,
    userId: number,
    mimeType: string
  ): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
    try {
      const timestamp = Date.now();
      const extension = mimeType.split("/")[1] || "jpg";
      const fileKey = `receipts/${userId}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

      const result = await storagePut(fileKey, imageBuffer, mimeType);

      return {
        success: true,
        url: result.url,
        key: result.key,
      };
    } catch (error) {
      console.error("[SupabaseReceiptsAdapter] saveReceiptImage error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save receipt image",
      };
    }
  }

  async suggestCategory(
    merchantName: string,
    userId: number
  ): Promise<{ category: string; confidence: number }> {
    const client = await this.getClient();

    const { data: userCategories } = await client
      .from("budget_categories")
      .select("name")
      .eq("user_id", userId);

    let categories = userCategories?.map(c => c.name) || [];

    if (categories.length === 0) {
      categories = [
        "Food & Dining",
        "Groceries",
        "Shopping",
        "Transportation",
        "Entertainment",
        "Healthcare",
        "Utilities",
        "Housing",
        "Other",
      ];
    }

    try {
      const prompt = `Given the merchant name "${merchantName}", suggest the most appropriate budget category from this list: ${categories.join(", ")}

Respond in JSON format:
{
  "category": "selected category name",
  "confidence": confidence score 0-100
}`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a financial categorization assistant. Suggest appropriate budget categories for merchants.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("No content in LLM response");
      }

      const result = JSON.parse(content);
      return {
        category: result.category || "Other",
        confidence: result.confidence || 50,
      };
    } catch (error) {
      console.error("[SupabaseReceiptsAdapter] suggestCategory error:", error);
      return { category: "Other", confidence: 0 };
    }
  }

  async learnFromCorrection(
    merchantName: string,
    categoryId: number,
    userId: number
  ): Promise<{ success: boolean }> {
    // In a production system, you would store this in a merchant_category_mappings table
    // For now, we'll just return success
    // TODO: Implement merchant learning table
    return { success: true };
  }

  async batchProcessReceipts(
    imageUrls: string[],
    userId: number
  ): Promise<{
    success: boolean;
    results: Array<{ url: string; data?: ReceiptData; error?: string }>;
  }> {
    const results = await Promise.all(
      imageUrls.map(async (url) => {
        const result = await this.processReceiptImage(url, userId);
        return {
          url,
          data: result.data,
          error: result.error,
        };
      })
    );

    return {
      success: true,
      results,
    };
  }
}
