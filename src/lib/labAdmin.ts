import { cookies } from "next/headers";

export async function checkLabAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("lab_admin")?.value;
  const expected = process.env.LAB_ADMIN_TOKEN || "lab-admin-secret";
  return token === expected;
}
