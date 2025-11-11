
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Link as LinkIcon, File, Code, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner-toast";
import { scanFile } from "@/lib/api/scanner-api";
import {
  validateUrl,
  validateApiEndpoint,
  validateFile,
  generateSafeFilename,
  type ValidatedInput,
} from "@/lib/validation";
import { ScanError, ScanTimeoutError } from "../../lib/errors";

export const UploadSection = () => {
  const [url, setUrl] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isScanning]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (isProcessing || isScanning) return;

      const file = files[0];
      setIsProcessing(true);
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        const validation = validateFile(file);
        if (!validation.valid) {
          toast.error("File validation failed", { description: validation.error });
          return;
        }

        const safeFilename = await generateSafeFilename(file);
        const validatedInput: ValidatedInput = {
          type: "file",
          original: file,
          safeFilename,
          timestamp: Date.now(),
        };

        toast.success(`File validated successfully`, { description: `${file.name} → ${safeFilename}` });

        setIsScanning(true);
        const scanResult = await scanFile(file, signal);
        setProgress(100);

        toast.success("File scanned successfully", { description: `Found ${scanResult.anomalies.length} anomalies.` });

        setTimeout(() => {
          navigate("/scan-results", { state: { scanResult } });
        }, 500);

      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          toast.info("Scan canceled", { description: "The file scan was successfully canceled." });
        } else {
          let title = "An unexpected error occurred";
          let description = "Please try again later.";

          if (error instanceof ScanTimeoutError) {
            title = "Scan Timed Out";
            description = error.message;
          } else if (error instanceof ScanError) {
            title = "Analysis Failed";
            description = error.message;
          } else if (error instanceof Error) {
            title = "File Processing Error";
            description = error.message;
          }
          
          toast.error(title, { description });
        }

      } finally {
        setIsProcessing(false);
        setIsScanning(false);
        setProgress(0);
        abortControllerRef.current = null;
      }
    },
    [isProcessing, isScanning, navigate]
  );

  const handleCancelScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  const handleUrlScan = () => { /* ... */ };
  const handleApiScan = () => { /* ... */ };

  return (
    <Card className="gradient-card shadow-card border-border/50 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary" />
        Start New Scan
      </h2>

      <Tabs defaultValue="file" className="w-full">
        {/* ... TabsList and other TabsContent ... */}
        
        <TabsContent value="file">
          {isScanning ? (
            <div className="text-center p-12">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg font-semibold mb-2">Analyzing your file...</p>
              <p className="text-sm text-muted-foreground mb-4">
                This may take a moment. We're looking for any potential threats.
              </p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">{Math.round(progress)}%</p>
              <Button variant="ghost" size="sm" onClick={handleCancelScan} className="mt-4">
                Cancel Scan
              </Button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
                isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"
              }`}
            >
              {/* ... upload UI ... */}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
