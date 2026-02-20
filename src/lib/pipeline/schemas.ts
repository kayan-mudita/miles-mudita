export const planTopicsSchema = {
  type: "object" as const,
  properties: {
    topic_1: { type: "string" as const, description: "Market Environment research topic" },
    topic_2: { type: "string" as const, description: "Competition research topic" },
    topic_3: { type: "string" as const, description: "Cost & Difficulty research topic" },
    topic_4: { type: "string" as const, description: "Product Need research topic" },
    topic_5: { type: "string" as const, description: "Financial Return research topic" },
  },
  required: ["topic_1", "topic_2", "topic_3", "topic_4", "topic_5"] as const,
};

export const introSchema = {
  type: "object" as const,
  properties: {
    title: { type: "string" as const, description: "Report title" },
    introduction: { type: "string" as const, description: "Introduction HTML paragraph" },
    chapter_1: { type: "string" as const, description: "Chapter 1 heading: Market Environment" },
    chapter_2: { type: "string" as const, description: "Chapter 2 heading: Competition" },
    chapter_3: { type: "string" as const, description: "Chapter 3 heading: Cost & Difficulty" },
    chapter_4: { type: "string" as const, description: "Chapter 4 heading: Product Need" },
    chapter_5: { type: "string" as const, description: "Chapter 5 heading: Financial Return" },
  },
  required: ["title", "introduction", "chapter_1", "chapter_2", "chapter_3", "chapter_4", "chapter_5"] as const,
};

export const subTopicPlannerSchema = {
  type: "object" as const,
  properties: {
    subQuestions: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "8-10 specific, searchable research questions",
    },
  },
  required: ["subQuestions"] as const,
};

export const researcherSchema = {
  type: "object" as const,
  properties: {
    sources: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          url: { type: "string" as const },
          title: { type: "string" as const },
          content: { type: "string" as const },
        },
        required: ["url", "title", "content"] as const,
      },
      description: "5-7 high-quality sources found",
    },
    synthesis: { type: "string" as const, description: "Synthesis of findings from this search" },
  },
  required: ["sources", "synthesis"] as const,
};

export const gapAnalysisSchema = {
  type: "object" as const,
  properties: {
    gaps: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Identified gaps in the research",
    },
    followUpQuestions: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Follow-up search queries to fill gaps",
    },
  },
  required: ["gaps", "followUpQuestions"] as const,
};

export const deepDiveSchema = {
  type: "object" as const,
  properties: {
    queries: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "3-5 highly specific data-hunting queries",
    },
  },
  required: ["queries"] as const,
};

export const writerSchema = {
  type: "object" as const,
  properties: {
    chapter_html: { type: "string" as const, description: "Full HTML chapter content (~3000 words)" },
    sources_used: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "URLs of sources referenced in this chapter",
    },
  },
  required: ["chapter_html", "sources_used"] as const,
};

export const scorerSchema = {
  type: "object" as const,
  properties: {
    dimension: { type: "string" as const },
    score: { type: "number" as const, description: "Score from 1-10" },
    justification: { type: "string" as const, description: "Detailed justification for the score" },
    strengths: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Key strengths identified",
    },
    weaknesses: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Key weaknesses identified",
    },
    key_risk: { type: "string" as const, description: "Single most important risk" },
  },
  required: ["dimension", "score", "justification", "strengths", "weaknesses", "key_risk"] as const,
};

export const scoringSummarySchema = {
  type: "object" as const,
  properties: {
    overall_score: { type: "number" as const, description: "Weighted overall score 1-10" },
    recommendation: {
      type: "string" as const,
      enum: ["GO", "NO-GO", "CONDITIONAL"],
      description: "Go/No-Go recommendation",
    },
    executive_summary_html: {
      type: "string" as const,
      description: "Executive summary HTML with key findings",
    },
    scoring_table_html: {
      type: "string" as const,
      description: "HTML scoring table summarizing all dimensions",
    },
    strengths: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Top 3 strengths across all dimensions",
    },
    risks: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Top 3 risks across all dimensions",
    },
  },
  required: ["overall_score", "recommendation", "executive_summary_html", "scoring_table_html", "strengths", "risks"] as const,
};
