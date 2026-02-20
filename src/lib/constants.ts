export const DIMENSIONS = [
  {
    title: "Market Environment",
    description:
      "Total addressable market size, growth trajectory, and regulatory landscape shaping your opportunity.",
    icon: "globe",
  },
  {
    title: "Competition",
    description:
      "Competitive density, incumbent strengths, and white-space opportunities waiting to be seized.",
    icon: "chess",
  },
  {
    title: "Cost & Difficulty",
    description:
      "Technical complexity, capital requirements, and barriers to building a viable first version.",
    icon: "diamond",
  },
  {
    title: "Product Need",
    description:
      "Urgency of the problem, existing alternatives, and how badly the market wants your solution.",
    icon: "target",
  },
  {
    title: "Financial Return",
    description:
      "Revenue model viability, margin potential, and path to sustainable unit economics.",
    icon: "chart",
  },
] as const;

export const PROCESS_STEPS = [
  {
    number: "01",
    title: "Submit Your Idea",
    description: "Describe your startup concept in a few sentences.",
  },
  {
    number: "02",
    title: "Miles Researches",
    description:
      "Our AI analyst dives deep across 25+ sources per dimension.",
  },
  {
    number: "03",
    title: "Get Your Report",
    description:
      "Receive a scored PDF report with a Go/No-Go recommendation.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "How long does a report take?",
    answer:
      "Miles typically delivers your full report in about 40 minutes. You'll receive two emails — first a one-page executive summary, then the complete scored PDF.",
  },
  {
    question: "What's included in the report?",
    answer:
      "Each report covers 5 dimensions with 12 sub-dimensions total, evidence-based scoring from 1-10, detailed research findings from 25+ sources, a net-net one-pager, and a clear Go/No-Go recommendation.",
  },
  {
    question: "How does the scoring work?",
    answer:
      "Miles uses an institutional-grade rubric. Each of the 5 dimensions is scored 1-10 by specialized AI analysts, backed by real research data. Scores are weighted and combined into an overall viability assessment.",
  },
  {
    question: "What kind of ideas can I submit?",
    answer:
      "Any startup or business concept — from SaaS products to consumer apps, marketplaces, hardware, and more. The more specific your description, the more targeted the research.",
  },
  {
    question: "Is my idea kept confidential?",
    answer:
      "Absolutely. Your submission is processed securely and never shared with third parties. We treat every idea with the discretion it deserves.",
  },
] as const;

export const TRACKING_STAGES = [
  { label: "Planning", description: "Designing research strategy", stage: "planning" },
  { label: "Researching", description: "Deep research across 1000+ sources", stage: "researching" },
  { label: "Writing", description: "Composing report chapters", stage: "writing" },
  { label: "Scoring", description: "Evaluating across 5 dimensions", stage: "scoring" },
  { label: "Generating", description: "Assembling your report", stage: "generating" },
  { label: "Complete", description: "Your report is ready", stage: "delivering" },
] as const;
