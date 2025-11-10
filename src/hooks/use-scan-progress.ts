
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Assuming you have a firebase config file

export function useScanProgress(scanId?: string) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"queued" | "scanning" | "completed" | "failed">("queued");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!scanId) return;

    const scanDocRef = doc(db, "scans", scanId);

    const unsubscribe = onSnapshot(scanDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProgress(data.progress || 0);
        setStatus(data.status || "queued");
        setMessage(data.message || "");
      }
    });

    return () => unsubscribe();
  }, [scanId]);

  return { progress, status, message };
}
