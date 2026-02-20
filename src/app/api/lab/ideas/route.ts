import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const SEED_IDEAS = [
  { title: "Hivemind", description: "AI that knows what your team knows.", category: "Knowledge", votes: 142, iconName: "Brain", status: "building" },
  { title: "Perceptron", description: "The search bar your business deserves.", category: "Data", votes: 198, iconName: "Search", status: "building" },
  { title: "Relay", description: "Build an AI department in minutes.", category: "Operations", votes: 156, iconName: "GitBranch", status: "concept" },
  { title: "ShiftLoop", description: "Smart labor scheduling for manufacturing and logistics.", category: "Operations", votes: 87, iconName: "Clock", status: "building" },
  { title: "QuickGrowth", description: "Done-for-you AI automation in 48 hours.", category: "Growth", votes: 124, iconName: "Zap", status: "concept" },
  { title: "Mainstreet", description: "Where AI-native businesses get built.", category: "Growth", votes: 73, iconName: "Building", status: "concept" },
  { title: "Molar", description: "The AI compliance officer for dentistry.", category: "Operations", votes: 65, iconName: "Shield", status: "building" },
  { title: "Zoe Diagnostics", description: "Company health diagnostics every business needs.", category: "Diligence", votes: 183, iconName: "Eye", status: "building" },
  { title: "CandidateAssessor", description: "See candidates do the job before you hire them.", category: "Talent", votes: 211, iconName: "UserCheck", status: "beta", url: "https://candidateassessor.com/" },
  { title: "Glint", description: "The easiest way to get better at AI.", category: "Knowledge", votes: 94, iconName: "Lightbulb", status: "concept" },
];

async function ensureSeeded() {
  const count = await prisma.labIdea.count();
  if (count === 0) {
    await prisma.labIdea.createMany({ data: SEED_IDEAS });
  }
}

export async function GET() {
  await ensureSeeded();
  const ideas = await prisma.labIdea.findMany({ orderBy: { votes: "desc" } });
  return NextResponse.json(ideas);
}
