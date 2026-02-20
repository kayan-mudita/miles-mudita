// ─── Score Dashboard Demo Data ───
export const DEMO_DIMENSIONS = [
  { key: "market", label: "Market Environment", score: 8.2 },
  { key: "competition", label: "Competition", score: 7.1 },
  { key: "cost", label: "Cost & Difficulty", score: 6.8 },
  { key: "product", label: "Product Need", score: 9.0 },
  { key: "financial", label: "Financial Return", score: 7.5 },
];

export const DEMO_OVERALL_SCORE = 7.7;
export const DEMO_RECOMMENDATION = "GO" as const;

// ─── Submit Form Demo Data ───
export const DEMO_FORM = {
  reportName: "AI-Powered Meal Planning App",
  searchTopic:
    "A mobile app that uses AI to create personalized weekly meal plans based on dietary preferences, health goals, and budget constraints. The app would integrate with grocery delivery services and provide nutritional breakdowns for each meal.",
  depth: "STANDARD" as const,
};

// ─── Dashboard Reports Demo Data ───
export const DEMO_REPORTS = [
  {
    id: "rpt-001",
    reportName: "AI-Powered Meal Planning App",
    searchTopic: "A mobile app that uses AI to create personalized weekly meal plans based on dietary preferences...",
    status: "COMPLETED",
    stage: "delivering",
    progress: 100,
    depth: "STANDARD",
    overallScore: 7.7,
    recommendation: "GO",
    createdAt: "2026-02-15T10:30:00Z",
  },
  {
    id: "rpt-002",
    reportName: "Sustainable Fashion Marketplace",
    searchTopic: "A marketplace connecting eco-conscious consumers with sustainable fashion brands and second-hand luxury items...",
    status: "COMPLETED",
    stage: "delivering",
    progress: 100,
    depth: "DEEP",
    overallScore: 6.4,
    recommendation: "CONDITIONAL",
    createdAt: "2026-02-12T14:15:00Z",
  },
  {
    id: "rpt-003",
    reportName: "Remote Team Culture Platform",
    searchTopic: "A SaaS platform helping distributed teams build company culture through virtual events, recognition, and async rituals...",
    status: "COMPLETED",
    stage: "delivering",
    progress: 100,
    depth: "QUICK",
    overallScore: 4.2,
    recommendation: "NO-GO",
    createdAt: "2026-02-10T09:00:00Z",
  },
  {
    id: "rpt-004",
    reportName: "AI Legal Document Review",
    searchTopic: "An AI tool that reviews legal contracts, flags risks, and suggests edits for small business owners...",
    status: "RUNNING",
    stage: "researching",
    progress: 45,
    depth: "DEEP",
    overallScore: null,
    recommendation: null,
    createdAt: "2026-02-18T08:00:00Z",
  },
  {
    id: "rpt-005",
    reportName: "Pet Health Monitoring Wearable",
    searchTopic: "A smart collar that monitors pet vital signs, activity levels, and sleep patterns with AI-powered health insights...",
    status: "QUEUED",
    stage: "planning",
    progress: 0,
    depth: "STANDARD",
    overallScore: null,
    recommendation: null,
    createdAt: "2026-02-18T08:30:00Z",
  },
  {
    id: "rpt-006",
    reportName: "Decentralized Freelance Network",
    searchTopic: "A blockchain-based platform for freelancers that eliminates middlemen fees and ensures instant payment...",
    status: "FAILED",
    stage: "researching",
    progress: 22,
    depth: "STANDARD",
    overallScore: null,
    recommendation: null,
    error: "Research timeout — external data sources unavailable",
    createdAt: "2026-02-08T16:45:00Z",
  },
];

// ─── Compare Reports Demo Data ───
export const DEMO_COMPARE_REPORTS = [
  {
    id: "rpt-001",
    reportName: "AI Meal Planning",
    depth: "STANDARD",
    overallScore: 7.7,
    recommendation: "GO",
    marketScore: 8.2,
    competitionScore: 7.1,
    costScore: 6.8,
    productScore: 9.0,
    financialScore: 7.5,
  },
  {
    id: "rpt-002",
    reportName: "Fashion Marketplace",
    depth: "DEEP",
    overallScore: 6.4,
    recommendation: "CONDITIONAL",
    marketScore: 7.8,
    competitionScore: 4.5,
    costScore: 6.2,
    productScore: 7.0,
    financialScore: 6.5,
  },
  {
    id: "rpt-003",
    reportName: "Remote Culture",
    depth: "QUICK",
    overallScore: 4.2,
    recommendation: "NO-GO",
    marketScore: 5.1,
    competitionScore: 3.2,
    costScore: 4.8,
    productScore: 4.5,
    financialScore: 3.4,
  },
];

// ─── Full Report Demo Data ───
export const DEMO_REPORT = {
  title: "AI-Powered Meal Planning App",
  sourceCount: 27,
  date: "February 15, 2026",
  executiveSummary: `<p>The AI-powered meal planning space represents a <strong>compelling opportunity</strong> driven by growing health consciousness, rising food costs, and increasing demand for personalized nutrition. The market is expanding rapidly with an estimated TAM of $12.4B by 2028.</p>
<p>While competition exists from established players like Mealime and Eat This Much, a significant <strong>white-space opportunity</strong> exists in combining AI personalization with grocery delivery integration and budget optimization — a combination no current player fully delivers.</p>
<p>The technical complexity is moderate, requiring a solid recommendation engine and API integrations with delivery services, but well within reach of a small engineering team using modern ML frameworks.</p>`,
  strengths: [
    "Large and growing TAM ($12.4B) with strong secular tailwinds in health & wellness",
    "Clear product-market fit signals — 73% of surveyed consumers want personalized meal plans",
    "Defensible moat through proprietary nutrition AI and grocery integration partnerships",
    "Strong unit economics potential with $15-25/mo subscription and low marginal cost",
  ],
  risks: [
    "Incumbent competition from MyFitnessPal (200M+ users) if they add meal planning features",
    "Grocery delivery API dependencies create platform risk (Instacart, DoorDash terms may change)",
    "User retention challenge — meal planning apps historically see 60% churn within 3 months",
  ],
  chapters: [
    {
      heading: "Market Environment",
      html: `<h3>Market Size & Growth</h3>
<p>The global meal planning market is valued at <strong>$7.2 billion in 2025</strong> and projected to reach $12.4 billion by 2028, representing a CAGR of 19.8%. Growth is driven by three converging trends: rising health consciousness post-pandemic, increasing food delivery infrastructure, and advances in AI personalization.</p>
<h3>Consumer Demand Signals</h3>
<p>Recent surveys indicate that 73% of health-conscious consumers aged 25-45 express strong interest in AI-powered meal planning tools. The willingness to pay ranges from $10-30/month, with higher intent among users already paying for fitness or nutrition apps.</p>
<h3>Regulatory Landscape</h3>
<p>The regulatory environment is favorable. Unlike medical nutrition therapy, general meal planning does not require FDA approval or dietitian licensing in most jurisdictions, though partnerships with registered dietitians strengthen credibility and compliance positioning.</p>`,
    },
  ],
  sources: [
    {
      dimension: "Market Environment",
      sources: [
        { url: "https://example.com/1", title: "Global Meal Kit Market Report 2025", content: "Comprehensive analysis of the meal planning and meal kit delivery market including TAM, growth projections, and competitive landscape" },
        { url: "https://example.com/2", title: "Consumer Health & Wellness Survey Q4 2025", content: "Survey of 5,000 US consumers on health technology adoption and willingness to pay for AI nutrition tools" },
        { url: "https://example.com/3", title: "AI in Food Tech: 2025 Industry Report", content: "Analysis of artificial intelligence applications in food technology including personalization engines and recommendation systems" },
        { url: "https://example.com/4", title: "Instacart Developer API Documentation", content: "Technical documentation for Instacart's grocery delivery integration API including rate limits and pricing" },
        { url: "https://example.com/5", title: "MyFitnessPal Annual User Growth Report", content: "Analysis of MyFitnessPal's user base growth, feature expansion strategy, and competitive positioning" },
        { url: "https://example.com/6", title: "Nutrition App Retention Benchmarks 2025", content: "Industry benchmarks for health and nutrition app retention rates across 30, 60, and 90 day windows" },
      ],
    },
    {
      dimension: "Competition",
      sources: [
        { url: "https://example.com/7", title: "Competitive Landscape: Meal Planning SaaS", content: "Deep dive into 15 meal planning competitors including feature comparison and pricing analysis" },
        { url: "https://example.com/8", title: "Mealime Series B Fundraise Analysis", content: "Analysis of Mealime's $28M Series B round and expansion strategy into AI personalization" },
        { url: "https://example.com/9", title: "Eat This Much Product Review & Teardown", content: "Product teardown of Eat This Much including UX analysis, feature gaps, and user feedback" },
      ],
    },
  ],
};
