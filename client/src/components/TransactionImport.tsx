import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  suggestedCategoryId: number | null;
  category?: string;
  notes?: string;
}

interface TransactionImportProps {
  onImportComplete: () => void;
}

export function TransactionImport({ onImportComplete }: TransactionImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const [categoryOverrides, setCategoryOverrides] = useState<Map<number, number>>(new Map());

  const { data: categories } = trpc.budget.getCategories.useQuery({});
  const parseFileMutation = trpc.transactionImport.parseFile.useMutation();
  const importMutation = trpc.transactionImport.importTransactions.useMutation();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "csv" && fileExtension !== "ofx" && fileExtension !== "qfx") {
      toast.error("Unsupported file format. Please upload a CSV or OFX file.");
      return;
    }

    setFile(selectedFile);

    // Read file content
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      try {
        const fileType = fileExtension === "csv" ? "csv" : "ofx";
        const result = await parseFileMutation.mutateAsync({
          fileContent: content,
          fileType,
        });

        // Convert Date objects to ISO strings for frontend state
        const transactionsWithStringDates = result.transactions.map((tx: any) => ({
          ...tx,
          date: tx.date instanceof Date ? tx.date.toISOString() : tx.date,
        }));
        setParsedTransactions(transactionsWithStringDates);
        // Select all transactions by default
        setSelectedTransactions(new Set(result.transactions.map((_, idx) => idx)));
        toast.success(`Found ${result.count} transactions`);
      } catch (error) {
        toast.error(
          `Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    const transactionsToImport = Array.from(selectedTransactions)
      .map((idx) => {
        const tx = parsedTransactions[idx];
        const categoryId = categoryOverrides.get(idx) || tx.suggestedCategoryId;

        if (!categoryId) return null;

        return {
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          categoryId,
          notes: tx.notes,
        };
      })
      .filter((tx) => tx !== null);

    if (transactionsToImport.length === 0) {
      toast.error("No transactions selected or all transactions are missing categories");
      return;
    }

    try {
      const result = await importMutation.mutateAsync({
        transactions: transactionsToImport,
        skipDuplicates: true,
      });

      toast.success(result.message);
      if (result.errors.length > 0) {
        console.error("Import errors:", result.errors);
      }

      // Close dialog and refresh
      setIsOpen(false);
      setFile(null);
      setParsedTransactions([]);
      setSelectedTransactions(new Set());
      setCategoryOverrides(new Map());
      onImportComplete();
    } catch (error) {
      toast.error(
        `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const toggleTransaction = (idx: number) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedTransactions(newSelected);
  };

  const toggleAll = () => {
    if (selectedTransactions.size === parsedTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(parsedTransactions.map((_, idx) => idx)));
    }
  };

  const updateCategory = (idx: number, categoryId: number) => {
    const newOverrides = new Map(categoryOverrides);
    newOverrides.set(idx, categoryId);
    setCategoryOverrides(newOverrides);
  };

  const formatAmount = (amount: number) => {
    const value = amount / 100;
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(Math.abs(value));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline">
        <Upload className="h-4 w-4 mr-2" />
        Import Transactions
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Bank Transactions</DialogTitle>
            <DialogDescription>
              Upload a CSV or OFX file from your bank to import transactions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            {!file && (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: CSV, OFX, QFX
                </p>
                <input
                  type="file"
                  accept=".csv,.ofx,.qfx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>
            )}

            {/* Transaction Preview */}
            {parsedTransactions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedTransactions.size === parsedTransactions.length}
                      onCheckedChange={toggleAll}
                    />
                    <span className="text-sm font-medium">
                      {selectedTransactions.size} of {parsedTransactions.length} selected
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setParsedTransactions([]);
                      setSelectedTransactions(new Set());
                      setCategoryOverrides(new Map());
                    }}
                  >
                    Clear
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="p-2 text-left w-12"></th>
                          <th className="p-2 text-left">Date</th>
                          <th className="p-2 text-left">Description</th>
                          <th className="p-2 text-right">Amount</th>
                          <th className="p-2 text-left">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedTransactions.map((tx, idx) => {
                          const categoryId =
                            categoryOverrides.get(idx) || tx.suggestedCategoryId;
                          const hasCategory = categoryId !== null;

                          return (
                            <tr
                              key={idx}
                              className={`border-t ${!hasCategory ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}`}
                            >
                              <td className="p-2">
                                <Checkbox
                                  checked={selectedTransactions.has(idx)}
                                  onCheckedChange={() => toggleTransaction(idx)}
                                  disabled={!hasCategory}
                                />
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {formatDate(tx.date)}
                              </td>
                              <td className="p-2">
                                <div className="flex items-start gap-2">
                                  {!hasCategory && (
                                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                  )}
                                  <span className="line-clamp-2">
                                    {tx.description}
                                  </span>
                                </div>
                              </td>
                              <td
                                className={`p-2 text-right whitespace-nowrap font-medium ${
                                  tx.amount >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {tx.amount >= 0 ? "+" : "-"}
                                {formatAmount(tx.amount)}
                              </td>
                              <td className="p-2">
                                <Select
                                  value={categoryId?.toString() || ""}
                                  onValueChange={(value) =>
                                    updateCategory(idx, parseInt(value))
                                  }
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories?.map((cat) => (
                                      <SelectItem
                                        key={cat.id}
                                        value={cat.id.toString()}
                                      >
                                        {cat.icon} {cat.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {parsedTransactions.some(
                  (tx, idx) =>
                    !categoryOverrides.has(idx) && !tx.suggestedCategoryId
                ) && (
                  <div className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>
                      Some transactions don't have a category assigned. Please select
                      a category for each transaction before importing.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={
                selectedTransactions.size === 0 || importMutation.isPending
              }
            >
              {importMutation.isPending ? (
                "Importing..."
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Import {selectedTransactions.size} Transactions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
