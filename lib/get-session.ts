import { authClient } from "./auth-client";

export async function getSession() {
  return await authClient.getSession();
}
