/* =========================================================
   NexHire — Centralized Application Configuration
   ========================================================= */

const API_BASE_URL = window.NEXHIRE_API_BASE_URL || "https://nexhire-deployment-899831107400.asia-south2.run.app/api/v1";

if (typeof window !== "undefined") {
  window.API_BASE_URL = API_BASE_URL;
}
