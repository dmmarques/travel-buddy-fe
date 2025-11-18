import { authClient } from "./auth-client";

const { data: session, error } = await authClient.getSession();
