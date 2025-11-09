import { useState, useCallback } from "react";
import { Upload, Link as LinkIcon, File, Code } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  validateUrl, 
  validateApiEndpoint, 
  validateFile, 
  generateSafeFilename,
  type ValidatedInput 
} from "@/lib/validation";

export const UploadSection = () => {
  const [url, setUrl] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, []);

  const handleFileUpload = async (files: File[]) => {
    if (isProcessing) return;
    
    const file = files[0];
    setIsProcessing(true);
    
    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error("File validation failed", {
          description: validation.error,
        });
        return;
      }
      
      // Generate safe filename
      const safeFilename = await generateSafeFilename(file);
      
      const validatedInput: ValidatedInput = {
        type: "file",
        original: file,
        safeFilename,
        timestamp: Date.now(),
      };
      
      toast.success(`File validated successfully`, {
        description: `${file.name} → ${safeFilename}`,
      });
      
      console.log("Validated file input:", validatedInput);
    } catch (error) {
      toast.error("File processing failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlScan = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const validation = validateUrl(url);
      if (!validation.valid) {
        toast.error("URL validation failed", {
          description: validation.error,
        });
        return;
      }
      
      const validatedInput: ValidatedInput = {
        type: "url",
        original: url,
        sanitized: validation.sanitized,
        timestamp: Date.now(),
      };
      
      toast.success("URL validated successfully", {
        description: `Scanning ${validation.sanitized}`,
      });
      
      console.log("Validated URL input:", validatedInput);
      setUrl("");
    } catch (error) {
      toast.error("URL processing failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApiScan = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const validation = validateApiEndpoint(apiEndpoint);
      if (!validation.valid) {
        toast.error("API endpoint validation failed", {
          description: validation.error,
        });
        return;
      }
      
      const validatedInput: ValidatedInput = {
        type: "api",
        original: apiEndpoint,
        sanitized: validation.sanitized,
        timestamp: Date.now(),
      };
      
      toast.success("API endpoint validated successfully", {
        description: `Scanning ${validation.sanitized}`,
      });
      
      console.log("Validated API input:", validatedInput);
      setApiEndpoint("");
    } catch (error) {
      toast.error("API endpoint processing failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="gradient-card shadow-card border-border/50 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary" />
        Start New Scan
      </h2>

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="url">
            <LinkIcon className="w-4 h-4 mr-2" />
            URL
          </TabsTrigger>
          <TabsTrigger value="api">
            <Code className="w-4 h-4 mr-2" />
            API
          </TabsTrigger>
          <TabsTrigger value="file">
            <File className="w-4 h-4 mr-2" />
            File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlScan()}
              className="flex-1 bg-input border-border"
              disabled={isProcessing}
            />
            <Button 
              onClick={handleUrlScan} 
              className="gradient-primary"
              disabled={isProcessing || !url}
            >
              {isProcessing ? "Validating..." : "Scan"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Input validation: URL format, suspicious patterns, size limits
          </p>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://api.example.com/v1/endpoint"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApiScan()}
              className="flex-1 bg-input border-border"
              disabled={isProcessing}
            />
            <Button 
              onClick={handleApiScan} 
              className="gradient-primary"
              disabled={isProcessing || !apiEndpoint}
            >
              {isProcessing ? "Validating..." : "Scan"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            API endpoint validation: HTTP(S) schema, path validation, security checks
          </p>
        </TabsContent>

        <TabsContent value="file">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Upload
              className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                isDragging ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <p className="text-sm font-medium mb-1">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Max 50MB • Allowed: .apk, .exe, .zip, .js, .py, and more
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".apk,.exe,.zip"
              onChange={(e) => {
                const files = e.target.files;
                if (files) handleFileUpload(Array.from(files));
              }}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Select Files"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
