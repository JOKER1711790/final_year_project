
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Globe,
  Code,
  Scan,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

type ScanType = "url" | "api" | "file";

export default function NewScan() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ScanType>("url");
  const [url, setUrl] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    toast.success("File selected", {
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });
  };

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
      handleFileSelect(files[0]);
    }
  }, []);

  const createScan = async (name: string, type: ScanType) => {
    setIsProcessing(true);
    try {
      // Create a new document in Firestore
      const docRef = await addDoc(collection(db, "scans"), {
        name,
        type,
        status: "queued",
        progress: 0,
        createdAt: new Date(),
      });

      const response = await fetch('http://localhost:3001/api/scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type, scanId: docRef.id }), // Pass the scanId to the backend
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Scan started successfully!");
        navigate('/scan-history');
      } else {
        toast.error("Failed to start scan", {
          description: data.error || "Unknown error",
        });
      }
    } catch (error) {
      toast.error("Failed to start scan", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">New Scan</h1>
            <p className="text-muted-foreground">
              Start a security scan for URLs, files, or API endpoints
            </p>
          </div>
          <Card className="gradient-card shadow-card border-border/50 p-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as ScanType)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="url">
                  <Globe className="w-4 h-4 mr-2" />
                  URL Scan
                </TabsTrigger>
                <TabsTrigger value="api">
                  <Code className="w-4 h-4 mr-2" />
                  API Scan
                </TabsTrigger>
                <TabsTrigger value="file">
                  <FileText className="w-4 h-4 mr-2" />
                  File Scan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url">
                <div className="space-y-2">
                  <Label htmlFor="url-input">Website URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url-input"
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isProcessing}
                    />
                    <Button
                      onClick={() => createScan(url, 'url')}
                      disabled={isProcessing || !url.trim()}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Scan className="w-4 h-4" />
                      )}
                      Scan URL
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="api">
                <div className="space-y-2">
                  <Label htmlFor="api-input">API Endpoint</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-input"
                      type="url"
                      placeholder="https://api.example.com/v1/users"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      disabled={isProcessing}
                    />
                    <Button
                      onClick={() => createScan(apiEndpoint, 'api')}
                      disabled={isProcessing || !apiEndpoint.trim()}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Scan className="w-4 h-4" />
                      )}
                      Scan API
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="file">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragging ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                >
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                  {selectedFile ? (
                    <div>
                      <p className="font-semibold">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                      <div className="flex gap-2 justify-center mt-4">
                        <Button
                          onClick={() => createScan(selectedFile.name, 'file')}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Scan className="w-4 h-4" />
                          )}
                          Scan File
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p>Drag and drop a file or</p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
    </DashboardLayout>
  );
}
