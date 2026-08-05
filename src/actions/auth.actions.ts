"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw err;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
