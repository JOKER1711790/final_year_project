
import { describe, it, expect, vi } from "vitest";
import { scanFile } from "./scanner-api";
import { ScanError, ScanTimeoutError } from "@/lib/errors";

// Mock File objects
const createMockFile = (name: string) => new File([""], name, { type: "text/plain" });

describe("scanFile API", () => {
  it("should return a clean result for a safe file", async () => {
    const file = createMockFile("clean.txt");
    const result = await scanFile(file);

    expect(result.anomalies).toHaveLength(0);
    expect(result.suggestions).toHaveLength(0);
    expect(result.confidence).toBeGreaterThan(90);
  });

  it("should return a critical anomaly for an infected file", async () => {
    const file = createMockFile("infected.exe");
    const result = await scanFile(file);

    expect(result.anomalies).toHaveLength(1);
    expect(result.anomalies[0].severity).toBe("critical");
    expect(result.anomalies[0].description).toContain("Malware detected");
  });

  it("should return a medium anomaly and a suggestion for a vulnerable file", async () => {
    const file = createMockFile("vulnerable.js");
    const result = await scanFile(file);

    expect(result.anomalies).toHaveLength(1);
    expect(result.anomalies[0].severity).toBe("medium");
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].title).toBe("Use HTTPS for API Calls");
  });

  it("should throw a ScanTimeoutError for a timeout scenario", async () => {
    const file = createMockFile("timeout.apk");

    await expect(scanFile(file)).rejects.toThrow(ScanTimeoutError);
  });

  it("should throw a ScanError for a generic error scenario", async () => {
    const file = createMockFile("error.pdf");

    await expect(scanFile(file)).rejects.toThrow(ScanError);
    await expect(scanFile(file)).rejects.not.toThrow(ScanTimeoutError);
  });
});
