import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as dbRoleAware from "./dbRoleAware";
import Papa from "papaparse";

// Common transaction format after parsing
interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number; // in cents
  category?: string;
  notes?: string;
}

/**
 * Parse CSV file content
 * Supports common CSV formats from banks
 */
function parseCSV(fileContent: string): ParsedTransaction[] {
  const result = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim().toLowerCase(),
  });

  if (result.errors.length > 0) {
    throw new Error(`CSV parsing error: ${result.errors[0].message}`);
  }

  const transactions: ParsedTransaction[] = [];
  const data = result.data as Record<string, string>[];

  for (const row of data) {
    // Try to find date column (common variations)
    const dateStr =
      row.date ||
      row.transactiondate ||
      row["transaction date"] ||
      row.posted ||
      row["posting date"] ||
      row.datetime;

    // Try to find amount column
    const amountStr =
      row.amount || row.debit || row.credit || row.value || row.transaction;

    // Try to find description column
    const description =
      row.description ||
      row.memo ||
      row.details ||
      row.narrative ||
      row.payee ||
      row.merchant ||
      "Imported transaction";

    if (!dateStr || !amountStr) {
      continue; // Skip rows without essential data
    }

    // Parse date
    let date: Date;
    try {
      date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // Try alternative date formats
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
          // Try MM/DD/YYYY or DD/MM/YYYY
          date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
          if (isNaN(date.getTime())) {
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }
      }
    } catch {
      continue; // Skip invalid dates
    }

    // Parse amount (handle negative signs, currency symbols, commas)
    let amount = parseFloat(
      amountStr.replace(/[£$€,]/g, "").trim()
    );

    if (isNaN(amount)) {
      continue; // Skip invalid amounts
    }

    // Convert to cents
    amount = Math.round(amount * 100);

    // Handle debit/credit columns separately
    if (row.debit && row.credit) {
      const debit = parseFloat(row.debit.replace(/[£$€,]/g, "").trim());
      const credit = parseFloat(row.credit.replace(/[£$€,]/g, "").trim());
      if (!isNaN(debit) && debit > 0) {
        amount = -Math.round(debit * 100); // Debit is negative
      } else if (!isNaN(credit) && credit > 0) {
        amount = Math.round(credit * 100); // Credit is positive
      }
    }

    transactions.push({
      date,
      description: description.trim(),
      amount,
      category: row.category?.trim(),
      notes: row.notes?.trim() || row.memo?.trim(),
    });
  }

  return transactions;
}

/**
 * Parse OFX file content (simple regex-based parser)
 */
function parseOFX(fileContent: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  // Simple regex to extract transaction blocks
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
  const matches = Array.from(fileContent.matchAll(stmtTrnRegex));

  for (const match of matches) {
    const txBlock = match[1];

    // Extract fields using regex
    const dateMatch = txBlock.match(/<DTPOSTED>(\d{8,14})/);
    const amountMatch = txBlock.match(/<TRNAMT>([\-\d.]+)/);
    const nameMatch = txBlock.match(/<NAME>([^<]+)/);
    const memoMatch = txBlock.match(/<MEMO>([^<]+)/);

    if (!dateMatch || !amountMatch) continue;

    // Parse OFX date format (YYYYMMDD or YYYYMMDDHHMMSS)
    const dateStr = dateMatch[1];
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const date = new Date(year, month, day);

    const amount = Math.round(parseFloat(amountMatch[1]) * 100);
    const description = nameMatch?.[1]?.trim() || memoMatch?.[1]?.trim() || "OFX Transaction";

    transactions.push({
      date,
      description,
      amount,
      notes: memoMatch?.[1]?.trim(),
    });
  }

  if (transactions.length === 0) {
    throw new Error("No transactions found in OFX file. Please ensure the file is in valid OFX format.");
  }

  return transactions;
}

/**
 * Auto-detect category based on description
 */
async function detectCategory(
  ctx: any,
  userId: number,
  description: string
): Promise<number | null> {
  const categories = await dbRoleAware.getUserBudgetCategories(ctx, userId);

  // Simple keyword matching
  const descLower = description.toLowerCase();

  // Income keywords
  if (
    descLower.includes("salary") ||
    descLower.includes("payroll") ||
    descLower.includes("deposit") ||
    descLower.includes("payment received")
  ) {
    const salaryCategory = categories.find(
      (c) => c.type === "income" && c.name.toLowerCase().includes("salary")
    );
    if (salaryCategory) return salaryCategory.id;
  }

  // Expense keywords
  const expenseKeywords: Record<string, string[]> = {
    housing: ["rent", "mortgage", "utilities", "electric", "gas", "water"],
    food: [
      "grocery",
      "supermarket",
      "restaurant",
      "cafe",
      "food",
      "dining",
    ],
    transport: ["gas", "fuel", "uber", "lyft", "taxi", "parking", "metro"],
    shopping: ["amazon", "walmart", "target", "shop", "store"],
    entertainment: ["netflix", "spotify", "movie", "cinema", "game"],
  };

  for (const [categoryName, keywords] of Object.entries(expenseKeywords)) {
    if (keywords.some((kw) => descLower.includes(kw))) {
      const category = categories.find(
        (c) =>
          c.type === "expense" &&
          c.name.toLowerCase().includes(categoryName)
      );
      if (category) return category.id;
    }
  }

  // Default to first expense category if no match
  const defaultExpense = categories.find((c) => c.type === "expense");
  return defaultExpense?.id || null;
}

export const transactionImportRouter = router({
  /**
   * Parse and preview transactions from uploaded file
   */
  parseFile: protectedProcedure
    .input(
      z.object({
        fileContent: z.string(),
        fileType: z.enum(["csv", "ofx"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let parsedTransactions: ParsedTransaction[];

      if (input.fileType === "csv") {
        parsedTransactions = parseCSV(input.fileContent);
      } else {
        parsedTransactions = parseOFX(input.fileContent);
      }

      // Sort by date (newest first)
      parsedTransactions.sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      // Auto-detect categories
      const transactionsWithCategories = await Promise.all(
        parsedTransactions.map(async (tx) => {
          const categoryId = await detectCategory(
            ctx,
            ctx.user.numericId,
            tx.description
          );
          return {
            ...tx,
            suggestedCategoryId: categoryId,
          };
        })
      );

      return {
        success: true,
        transactions: transactionsWithCategories,
        count: transactionsWithCategories.length,
      };
    }),

  /**
   * Import transactions after user confirmation
   */
  importTransactions: protectedProcedure
    .input(
      z.object({
        transactions: z.array(
          z.object({
            date: z.string().datetime(),
            description: z.string(),
            amount: z.number().int(),
            categoryId: z.number().int(),
            notes: z.string().optional(),
          })
        ),
        skipDuplicates: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const tx of input.transactions) {
        try {
          // Check for duplicates if requested
          if (input.skipDuplicates) {
            const existing =
              await dbRoleAware.findDuplicateTransaction(
                ctx,
                ctx.user.numericId,
                tx.date,
                tx.amount,
                tx.description
              );

            if (existing) {
              skipped++;
              continue;
            }
          }

          // Create transaction
          await dbRoleAware.createBudgetTransaction(ctx, {
            userId: ctx.user.numericId,
            categoryId: tx.categoryId,
            amount: tx.amount,
            transactionDate: tx.date,
            description: tx.description,
            notes: tx.notes,
            isRecurring: false,
          });

          imported++;
        } catch (error) {
          errors.push(
            `Failed to import transaction "${tx.description}": ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      return {
        success: true,
        imported,
        skipped,
        errors,
        message: `Successfully imported ${imported} transactions${skipped > 0 ? `, skipped ${skipped} duplicates` : ""}`,
      };
    }),
});
