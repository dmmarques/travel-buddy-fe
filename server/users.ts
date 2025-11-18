"use server";

import { eq, inArray, not } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../lib/auth";
import { db } from "../db/drizzle";
import { user } from "../db/schema";

export const getCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const currentUser = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .then((rows) => rows[0]);

  console.log("Current user in getCurrentUser:", currentUser);

  if (!currentUser) {
    redirect("/login");
  }

  return {
    ...session,
    currentUser,
  };
};

export const signIn = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error) {
    const e = error as Error;
    console.error("Error signing in:", e.message);
    return {
      success: false,
      message: e.message || "Could not sign in at this time.",
    };
  }
};

export const signUp = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    console.log("Signing up user:", username, email, password);
    await auth.api.signUpEmail({
      body: {
        name: username,
        email,
        password,
      },
    });
    console.log("Signed up user:", username, email, password);

    return {
      success: true,
      message: "Signed up successfully.",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};
