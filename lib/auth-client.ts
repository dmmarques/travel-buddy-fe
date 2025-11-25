import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
console.log("Auth Client Base URL:", baseURL);

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL,
});
