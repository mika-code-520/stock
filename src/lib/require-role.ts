import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@/generated/prisma/client";

export async function requireRole(allowed: Role[]) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const user = session.user;
  if (!allowed.includes(user.role)) {
    redirect("/");
  }
  return user;
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}
