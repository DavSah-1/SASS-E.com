import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Scan, X, Loader2 } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please enter barcode manually.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      stopCamera();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Scan Barcode</h3>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Camera View */}
      {isScanning && (
        <div className="mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg border"
            style={{ maxHeight: "300px" }}
          />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Position barcode in frame
          </p>
          <Button onClick={stopCamera} className="w-full mt-2" variant="outline">
            Stop Camera
          </Button>
        </div>
      )}

      {/* Camera Start Button */}
      {!isScanning && (
        <Button onClick={startCamera} className="w-full mb-4">
          <Scan className="mr-2 h-4 w-4" />
          Start Camera Scanner
        </Button>
      )}

      {/* Manual Entry */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Or enter barcode manually:</p>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter barcode number"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
          />
          <Button onClick={handleManualSubmit} disabled={!manualBarcode.trim()}>
            Search
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Note: Camera scanning requires browser support. Use manual entry if camera is unavailable.
      </p>
    </Card>
  );
}
