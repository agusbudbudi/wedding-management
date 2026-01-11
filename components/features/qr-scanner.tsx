"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  isScanning: boolean;
  setIsScanning: (isScanning: boolean) => void;
}

export function QRScanner({
  onScan,
  isScanning,
  setIsScanning,
}: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      // Initialize scanner
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          scanner.clear();
          scannerRef.current = null;
          setIsScanning(false);
        },
        (errorMessage) => {
          // console.warn(errorMessage);
        }
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(console.error);
        } catch (e) {
          // ignore cleanup errors
        }
        scannerRef.current = null;
      }
    };
  }, [isScanning, onScan, setIsScanning]);

  return (
    <Card className="p-4 w-full h-[400px] flex flex-col items-center justify-center bg-gray-50 border-dashed">
      {isScanning ? (
        <div id="reader" className="w-full h-full" />
      ) : (
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-gray-300 mx-auto animate-spin" />
          <p className="text-gray-500">Camera Active</p>
          <Button onClick={() => setIsScanning(true)}>Reset Scanner</Button>
        </div>
      )}
    </Card>
  );
}
