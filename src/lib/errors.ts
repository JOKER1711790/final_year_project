
/**
 * Custom error types for the application.
 */

/**
 * A general error that occurs during a scan.
 */
export class ScanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanError";
  }
}

/**
 * An error that occurs when a scan takes too long to complete.
 */
export class ScanTimeoutError extends ScanError {
  constructor(message: string = "Scan timed out") {
    super(message);
    this.name = "ScanTimeoutError";
  }
}
