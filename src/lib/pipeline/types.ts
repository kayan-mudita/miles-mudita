export interface Source {
  url: string;
  title: string;
  content: string;
  dimension?: string;
  round?: number;
}

export interface ResearchRound {
  round: number;
  queries: string[];
  sources: Source[];
  findings: string;
  gaps: string[];
}

export interface DimensionData {
  topic: string;
  subQuestions: string[];
  researchRounds: ResearchRound[];
  allSources: Source[];
  allFindings: string;
  chapter: WriterOutput | null;
  score: ScorerOutput | null;
}

export interface PlanTopicsOutput {
  topic_1: string;
  topic_2: string;
  topic_3: string;
  topic_4: string;
  topic_5: string;
}

export interface IntroOutput {
  title: string;
  introduction: string;
  chapter_1: string;
  chapter_2: string;
  chapter_3: string;
  chapter_4: string;
  chapter_5: string;
}

export interface WriterOutput {
  chapter_html: string;
  sources_used: string[];
}

export interface ScorerOutput {
  dimension: string;
  score: number;
  justification: string;
  strengths: string[];
  weaknesses: string[];
  key_risk: string;
}

export interface ScoringSummaryOutput {
  overall_score: number;
  recommendation: "GO" | "NO-GO" | "CONDITIONAL";
  executive_summary_html: string;
  scoring_table_html: string;
  strengths: string[];
  risks: string[];
}

export interface SubTopicPlannerOutput {
  subQuestions: string[];
}

export interface GapAnalysisOutput {
  gaps: string[];
  followUpQuestions: string[];
}

export interface DeepDiveOutput {
  queries: string[];
}

export interface ResearcherOutput {
  sources: Source[];
  synthesis: string;
}

export interface ResearchContext {
  searchTopic: string;
  reportName: string;
  topics: PlanTopicsOutput | null;
  intro: IntroOutput | null;
  dimensions: {
    [key: string]: DimensionData;
  };
  crossDimensionInsights: string[];
  globalSourceIndex: Source[];
  scoringSummary: ScoringSummaryOutput | null;
}

export type JobStage =
  | "queued"
  | "planning"
  | "researching"
  | "writing"
  | "scoring"
  | "generating"
  | "delivering"
  | "completed"
  | "failed";

export interface JobState {
  id: string;
  status: "running" | "completed" | "failed";
  stage: JobStage;
  progress: number;
  detail: string;
  report: string | null;
  context: ResearchContext | null;
  error: string | null;
  createdAt: number;
  updatedAt: number;
}

export const DIMENSION_KEYS = [
  "market_environment",
  "competition",
  "cost_difficulty",
  "product_need",
  "financial_return",
] as const;

export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  market_environment: "Market Environment",
  competition: "Competition",
  cost_difficulty: "Cost & Difficulty",
  product_need: "Product Need",
  financial_return: "Financial Return",
};

export const CLAUDE_MODEL = "claude-sonnet-4-5-20250929";
