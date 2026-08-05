import { redirect } from "next/navigation";
import { requireSession } from "@/lib/require-role";

export default async function HomePage() {
  const user = await requireSession();
  redirect(user.role === "ADMIN" ? "/admin" : "/vendedor");
}
