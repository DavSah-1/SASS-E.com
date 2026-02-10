import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as dbRoleAware from "./dbRoleAware";
import ExcelJS from "exceljs";

/**
 * Budget Export Router
 * Handles exporting budget transactions in CSV, PDF, and Excel formats
 */
export const budgetExportRouter = router({
  /**
   * Export transactions as CSV
   */
  exportCSV: protectedProcedure
    .input(
      z.object({
        monthYear: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const transactions = await dbRoleAware.getUserBudgetTransactions(
        ctx,
        ctx.user.numericId,
        {
          limit: input.limit || 1000,
        }
      );
      
      // Get categories for mapping
      const categories = await dbRoleAware.getUserBudgetCategories(ctx, ctx.user.numericId);
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));

      // Generate CSV content
      const headers = ["Date", "Description", "Category", "Amount", "Notes"];
      const rows = transactions.map((tx: any) => [
        new Date(tx.transactionDate).toLocaleDateString("en-GB"),
        tx.description || "No description",
        categoryMap.get(tx.categoryId) || "Uncategorized",
        `£${(tx.amount / 100).toFixed(2)}`,
        tx.notes || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((cell) => {
              // Escape quotes and wrap in quotes if contains comma or quotes
              const cellStr = String(cell);
              if (cellStr.includes(",") || cellStr.includes('"')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cellStr;
            })
            .join(",")
        ),
      ].join("\n");

      return {
        content: csvContent,
        filename: `budget_transactions_${new Date().toISOString().split("T")[0]}.csv`,
        mimeType: "text/csv",
      };
    }),

  /**
   * Export transactions as Excel
   */
  exportExcel: protectedProcedure
    .input(
      z.object({
        monthYear: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const transactions = await dbRoleAware.getUserBudgetTransactions(
        ctx,
        ctx.user.numericId,
        {
          limit: input.limit || 1000,
        }
      );
      
      // Get categories for mapping
      const categories = await dbRoleAware.getUserBudgetCategories(ctx, ctx.user.numericId);
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Transactions");

      // Add headers with styling
      worksheet.columns = [
        { header: "Date", key: "date", width: 12 },
        { header: "Description", key: "description", width: 30 },
        { header: "Category", key: "category", width: 20 },
        { header: "Amount", key: "amount", width: 12 },
        { header: "Notes", key: "notes", width: 30 },
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // Add data rows
      transactions.forEach((tx: any) => {
        const row = worksheet.addRow({
          date: new Date(tx.transactionDate).toLocaleDateString("en-GB"),
          description: tx.description || "No description",
          category: categoryMap.get(tx.categoryId) || "Uncategorized",
          amount: tx.amount / 100,
          notes: tx.notes || "",
        });

        // Color code amounts (green for positive, red for negative)
        const amountCell = row.getCell("amount");
        amountCell.numFmt = "£#,##0.00";
        if (tx.amount >= 0) {
          amountCell.font = { color: { argb: "FF00AA00" } };
        } else {
          amountCell.font = { color: { argb: "FFAA0000" } };
        }
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      return {
        content: base64,
        filename: `budget_transactions_${new Date().toISOString().split("T")[0]}.xlsx`,
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    }),

  /**
   * Export transactions as PDF
   */
  exportPDF: protectedProcedure
    .input(
      z.object({
        monthYear: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const transactions = await dbRoleAware.getUserBudgetTransactions(
        ctx,
        ctx.user.numericId,
        {
          limit: input.limit || 1000,
        }
      );
      
      // Get categories for mapping
      const categories = await dbRoleAware.getUserBudgetCategories(ctx, ctx.user.numericId);
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));

      // Calculate summary
      const totalIncome = transactions
        .filter((tx: any) => tx.amount > 0)
        .reduce((sum: number, tx: any) => sum + tx.amount, 0);
      const totalExpenses = transactions
        .filter((tx: any) => tx.amount < 0)
        .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0);
      const netCashFlow = totalIncome - totalExpenses;

      // Generate HTML for PDF
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    .summary {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      font-size: 16px;
    }
    .summary-item strong {
      font-weight: bold;
    }
    .income {
      color: #059669;
    }
    .expense {
      color: #dc2626;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:hover {
      background: #f9fafb;
    }
    .amount-positive {
      color: #059669;
      font-weight: bold;
    }
    .amount-negative {
      color: #dc2626;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Budget Transactions Report</h1>
  <p>Generated on ${new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="summary-item">
      <span>Total Income:</span>
      <strong class="income">£${(totalIncome / 100).toFixed(2)}</strong>
    </div>
    <div class="summary-item">
      <span>Total Expenses:</span>
      <strong class="expense">£${(totalExpenses / 100).toFixed(2)}</strong>
    </div>
    <div class="summary-item">
      <span>Net Cash Flow:</span>
      <strong class="${netCashFlow >= 0 ? "income" : "expense"}">£${(
        netCashFlow / 100
      ).toFixed(2)}</strong>
    </div>
    <div class="summary-item">
      <span>Total Transactions:</span>
      <strong>${transactions.length}</strong>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Category</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${transactions
        .map(
          (tx: any) => `
        <tr>
          <td>${new Date(tx.transactionDate).toLocaleDateString("en-GB")}</td>
          <td>${tx.description || "No description"}</td>
          <td>${categoryMap.get(tx.categoryId) || "Uncategorized"}</td>
          <td class="${tx.amount >= 0 ? "amount-positive" : "amount-negative"}">
            ${tx.amount >= 0 ? "+" : "-"}£${Math.abs(tx.amount / 100).toFixed(2)}
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="footer">
    <p>SASS-E Budget Report | Confidential</p>
  </div>
</body>
</html>
      `;

      return {
        content: html,
        filename: `budget_transactions_${new Date().toISOString().split("T")[0]}.pdf`,
        mimeType: "application/pdf",
      };
    }),
});
