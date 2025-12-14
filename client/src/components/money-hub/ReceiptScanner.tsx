import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Camera, Upload, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ReceiptData {
  merchant: string;
  amount: number;
  date: Date;
  category: string;
  categoryId?: number;
  confidence: number;
  items?: Array<{ name: string; amount: number }>;
  tax?: number;
  tip?: number;
}

export function ReceiptScanner() {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ReceiptData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const { data: categories = [] } = trpc.budget.getCategories.useQuery({});

  const processReceipt = trpc.budget.processReceipt.useMutation({
    onSuccess: (result) => {
      if (result.success && result.data) {
        setExtractedData(result.data);
        toast.success("Receipt processed successfully!");
      } else {
        toast.error(result.error || "Failed to process receipt");
      }
      setIsProcessing(false);
    },
    onError: () => {
      toast.error("Failed to process receipt");
      setIsProcessing(false);
    },
  });

  const createTransaction = trpc.budget.createTransaction.useMutation({
    onSuccess: () => {
      toast.success("Transaction added!");
      utils.budget.getTransactions.invalidate();
      utils.budget.getMonthlySummary.invalidate();
      handleClose();
    },
    onError: () => {
      toast.error("Failed to add transaction");
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    // Convert file to base64 for upload
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;

      // In a real implementation, you would upload to S3 first
      // For now, we'll use the base64 data URL directly
      processReceipt.mutate({ imageUrl: base64 });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAddTransaction = () => {
    if (!extractedData) return;

    const categoryId =
      extractedData.categoryId ||
      categories.find((c) => c.name === extractedData.category)?.id;

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    createTransaction.mutate({
      categoryId,
      amount: extractedData.amount,
      description: `${extractedData.merchant} - Receipt`,
      transactionDate: extractedData.date.toISOString(),
      notes: extractedData.items
        ? `Items: ${extractedData.items.map((i) => i.name).join(", ")}`
        : undefined,
    });
  };

  const handleClose = () => {
    setShowScanner(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setIsProcessing(false);
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Receipt Scanner
          </CardTitle>
          <CardDescription className="text-gray-400">
            Scan receipts to automatically add transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowScanner(true)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Scan Receipt
          </Button>
        </CardContent>
      </Card>

      {/* Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-green-900/90 to-teal-900/90 border-green-500/50">
          <DialogHeader>
            <DialogTitle className="text-white">Scan Receipt</DialogTitle>
            <DialogDescription className="text-gray-300">
              Upload a receipt image to automatically extract transaction details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Upload */}
            {!previewUrl && (
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-300 mb-4">Upload a receipt image</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}

            {/* Preview & Processing */}
            {previewUrl && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="w-full max-h-64 object-contain rounded-lg border border-white/20"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>

                {!extractedData && !isProcessing && (
                  <Button
                    onClick={handleUpload}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Process Receipt
                  </Button>
                )}

                {/* Extracted Data */}
                {extractedData && (
                  <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Extracted Data</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Confidence:</span>
                        <span
                          className={`text-sm font-medium ${
                            extractedData.confidence >= 80
                              ? "text-green-400"
                              : extractedData.confidence >= 60
                                ? "text-yellow-400"
                                : "text-red-400"
                          }`}
                        >
                          {extractedData.confidence}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-400">Merchant</Label>
                        <Input
                          value={extractedData.merchant}
                          onChange={(e) =>
                            setExtractedData({ ...extractedData, merchant: e.target.value })
                          }
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-400">Amount</Label>
                        <Input
                          type="number"
                          value={(extractedData.amount / 100).toFixed(2)}
                          onChange={(e) =>
                            setExtractedData({
                              ...extractedData,
                              amount: Math.round(parseFloat(e.target.value) * 100),
                            })
                          }
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-400">Date</Label>
                        <Input
                          type="date"
                          value={new Date(extractedData.date).toISOString().split("T")[0]}
                          onChange={(e) =>
                            setExtractedData({
                              ...extractedData,
                              date: new Date(e.target.value),
                            })
                          }
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-400">Category</Label>
                        <Select
                          value={extractedData.category}
                          onValueChange={(value) =>
                            setExtractedData({ ...extractedData, category: value })
                          }
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>
                                {cat.icon} {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Items */}
                    {extractedData.items && extractedData.items.length > 0 && (
                      <div>
                        <Label className="text-gray-400 mb-2 block">Items</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {extractedData.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm p-2 bg-white/5 rounded"
                            >
                              <span className="text-white">{item.name}</span>
                              <span className="text-gray-400">
                                ${(item.amount / 100).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleAddTransaction}
                        disabled={createTransaction.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                      <Button
                        onClick={handleClose}
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
