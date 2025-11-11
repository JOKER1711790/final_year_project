
import { AIAnalysisResult, SuggestionType } from "@/lib/scanner/ai-analysis";
import { ScanError, ScanTimeoutError } from "@/lib/errors";

const createAbortablePromise = <T>(executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void, signal?: AbortSignal): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException("Aborted", "AbortError"));
    }

    const abortHandler = () => {
      reject(new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", abortHandler);

    executor(resolve, reject);
  });
};

export const scanFile = async (file: File, signal?: AbortSignal): Promise<AIAnalysisResult> => {
  console.log(`Scanning file: ${file.name}`);

  await createAbortablePromise((resolve) => setTimeout(resolve, 2000), signal);

  switch (file.name) {
    case "infected.exe":
      return {
        anomalies: [
          {
            id: "ANOM-MAL-001",
            type: "SUSPICIOUS_PATTERN",
            severity: "critical",
            description: "Malware detected. The file contains a known virus signature.",
            location: "0x00401000",
            confidence: 99,
            recommendation: "Quarantine and delete the file immediately. Do not execute.",
          },
        ],
        suggestions: [],
        confidence: 99,
        modelVersion: "2.0.0",
        analyzedAt: new Date(),
      };

    case "vulnerable.js":
      return {
        anomalies: [
          {
            id: "ANOM-VULN-001",
            type: "DATA_LEAKAGE_RISK",
            severity: "medium",
            description: "Potential data leakage risk. The code sends user data to a third-party domain without encryption.",
            location: "line 152",
            confidence: 75,
            recommendation: "Ensure all data is sent over HTTPS and that the third-party domain is trusted.",
          },
        ],
        suggestions: [
          {
            id: "SUG-VULN-001",
            type: "CODE_FIX",
            priority: "high",
            title: "Use HTTPS for API Calls",
            description: "All API endpoints should be called over HTTPS to prevent man-in-the-middle attacks.",
          },
        ],
        confidence: 75,
        modelVersion: "2.0.0",
        analyzedAt: new Date(),
      };

    case "timeout.apk":
      await createAbortablePromise((resolve) => setTimeout(resolve, 3000), signal);
      throw new ScanTimeoutError("The file is too large to be analyzed in a timely manner.");

    case "error.pdf":
      throw new ScanError("Could not parse the file. It may be corrupted.");

    case "clean.txt":
    default:
      return {
        anomalies: [],
        suggestions: [],
        confidence: 95,
        modelVersion: "2.0.0",
        analyzedAt: new Date(),
      };
  }
};
