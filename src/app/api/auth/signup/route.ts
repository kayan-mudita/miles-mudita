import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { checkSignupRateLimit } from "@/lib/rateLimit";

const SIGNUP_LIMIT = 50; // max signups globally per window
const SIGNUP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  try {
    const { limited } = await checkSignupRateLimit(SIGNUP_LIMIT, SIGNUP_WINDOW_MS);
    if (limited) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
