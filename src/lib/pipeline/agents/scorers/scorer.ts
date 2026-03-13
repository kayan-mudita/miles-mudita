import { runAgent } from "../../runAgent";
import { scorerSchema } from "../../schemas";
import { ScorerOutput, ResearchContext, DimensionKey, DIMENSION_LABELS } from "../../types";
import { serializeDimensionForScorer } from "../../researchContext";

const RUBRICS: Record<DimensionKey, string> = {
  market_environment: `Categories (with weights for weighted average):

1. TAM (Total Addressable Market) — Weight: 3
  1 = <$100M
  2 = $100M-$150M
  3 = $150M-$250M
  4 = $250M-$400M
  5 = $400M-$600M
  6 = $600M-$800M
  7 = $800M-$1B
  8 = $1B-$3B
  9 = $3B-$10B
  10 = >$10B

2. Market Growth Rate — Weight: 3
  1 = <2% (stagnant/declining)
  2 = 2%
  3 = 3%
  4 = 4%
  5 = 5-6%
  6 = 7-8%
  7 = 9-10%
  8 = 11-15%
  9 = 16-20%
  10 = >20%

Overall dimension score = (TAM × 3 + Growth × 3) / 6`,

  competition: `Categories (with weights for weighted average):

1. Capital Raised by Competitors — Weight: 2
  1 = >$1B
  2 = $750M-$1B
  3 = $500M-$750M
  4 = $200M-$500M
  5 = $100M-$200M
  6 = $50M-$100M
  7 = $25M-$50M
  8 = $10M-$25M
  9 = $5M-$10M
  10 = <$5M

2. Competitor Landscape — Weight: 2
  1 = Many well-funded dominant players
  2 = Several well-funded with strong traction
  3 = Multiple direct competitors with scale
  4 = Direct competitors with traction
  5 = Several indirect competitors, credible but niche
  6 = Some indirect competitors, differentiation still clear
  7 = Few companies, no clear leader
  8 = 1-2 small entrants, early market
  9 = Essentially no credible competitors
  10 = Zero companies

3. Ease of Copying / Moat — Weight: 2
  1 = Trivially copyable, no barriers
  2 = Easy to copy, no moat
  3 = Visible idea, modest differentiation
  4 = Somewhat hard, execution quality matters
  5 = Harder, niche insight or early traction
  6 = Requires domain expertise
  7 = Requires complex ops or partnerships
  8 = Unique data or expertise, strong barrier
  9 = Regulation/network effects
  10 = Patents/exclusive rights, near impossible to copy

4. Winner-Takes-All Dynamics — Weight: 2
  1 = Already won by incumbent
  2 = Emerging dominant leader
  3 = Consolidated, winner-takes-most
  4 = Strong leaders, but fragmented
  5 = Standard fragmented market
  6 = Fragmented, moderate concentration
  7 = Niche opening in WTA market
  8 = Wide opening in WTA, no leader
  9 = Strong WTA potential, unblocked
  10 = Unclaimed WTA proposition

Overall dimension score = (Funding × 2 + Landscape × 2 + Moat × 2 + WTA × 2) / 8`,

  cost_difficulty: `Categories (with weights for weighted average):

1. Capital Required (Initial Startup Cost) — Weight: 4
  1 = >$10M
  2 = $5M-$10M
  3 = $3M-$5M
  4 = $2M-$3M
  5 = $1M-$2M
  6 = $500K-$1M
  7 = $250K-$500K
  8 = $100K-$250K
  9 = $50K-$100K
  10 = <$50K

2. Technology Required — Weight: 3
  1 = "Miracle tech" only, impossible today
  2 = Multi-year deep R&D, extreme risk
  3 = Novel algorithms/hardware, breakthrough required
  4 = Complex integrations, uncertain feasibility
  5 = Advanced defensible tech, deep expertise
  6 = Sophisticated but visible build path
  7 = Solid engineering lift, achievable
  8 = Slightly advanced SaaS/app stack
  9 = Standard SaaS/app tech
  10 = Commodity tech, trivial to build

3. GTM Difficulty — Weight: 5
  1 = Very hard (12+ month cycles, lobbying)
  2 = Hard (enterprise 6-12 month cycles)
  3 = Enterprise mid-market, friction
  4 = Partnerships/outbound, moderate friction
  5 = SMB outbound, moderate ease
  6 = SMB faster conversion
  7 = D2C or SMB, short cycles
  8 = Relatively easy self-serve
  9 = Easy sales, viral or bottom-up
  10 = Viral/self-serve, negligible friction

4. Land and Expand Potential — Weight: 3
  1 = One-and-done sale
  2 = Very limited expansion
  3 = Limited recurring, occasional add-ons
  4 = Some expansion, not primary growth
  5 = Moderate upsell
  6 = Moderate recurring expansion
  7 = Strong upsell in accounts
  8 = Built-in expansion (seats, teams)
  9 = Multi-vector expansion
  10 = Continuous land/expand, usage-based

Overall dimension score = (Capital × 4 + Tech × 3 + GTM × 5 + L&E × 3) / 15`,

  product_need: `Categories (with weights for weighted average):

1. Problem Urgency — Weight: 4
  1 = No clear problem
  2 = Low priority, episodic
  3 = Nice-to-have
  4 = Moderate efficiency gain
  5 = Important, not urgent
  6 = Noticeable friction, modest WTP
  7 = High priority, real inefficiency/cost
  8 = Strong pain point, unlocks big value
  9 = Hair-on-fire problem for some
  10 = Critical mission-level painkiller

2. Willingness to Pay — Weight: 3
  1 = No evidence anyone would pay
  2 = Users expect this for free
  3 = Tiny budgets, heavy price sensitivity
  4 = Some willingness, but low priority spend
  5 = Moderate — would pay if clearly better
  6 = Established budget category, fair WTP
  7 = Strong WTP, replaces existing spend
  8 = High WTP, solves expensive problem
  9 = Eager buyers, budget already allocated
  10 = Urgent buyer, price is secondary to solution

3. Frequency & Retention — Weight: 3
  1 = One-time use, no reason to return
  2 = Rare use (once a year or less)
  3 = Occasional use (a few times a year)
  4 = Periodic use (monthly)
  5 = Regular use (bi-weekly)
  6 = Frequent use (weekly)
  7 = High frequency (multiple times per week)
  8 = Daily use, habit-forming
  9 = Multiple daily uses, deeply embedded
  10 = Always-on, mission-critical workflow

Overall dimension score = (Urgency × 4 + WTP × 3 + Frequency × 3) / 10`,

  financial_return: `Categories (with weights for weighted average):

1. Revenue Model Strength — Weight: 3
  1 = No clear revenue model
  2 = Highly speculative, unproven model
  3 = Weak model, heavy reliance on ads or volume
  4 = Plausible model, low pricing power
  5 = Standard model, moderate pricing power
  6 = Solid recurring model (SaaS, subscription)
  7 = Strong recurring model with expansion revenue
  8 = Multiple revenue streams, strong pricing power
  9 = Exceptional model, usage-based with high retention
  10 = Best-in-class model, compounding revenue with network effects

2. Unit Economics & Margins — Weight: 4
  1 = Negative unit economics, no path to profitability
  2 = Deeply negative, requires massive scale
  3 = Negative, but path visible at scale
  4 = Breakeven at scale, thin margins
  5 = Modest positive margins (30-40%)
  6 = Healthy margins (50-60%)
  7 = Strong margins (60-70%)
  8 = Very strong margins (70-80%), efficient delivery
  9 = Exceptional margins (80%+), software-like
  10 = Near-zero marginal cost, 90%+ gross margins

3. Exit Likelihood (3-5 Years) — Weight: 3
  1 = Very unlikely, no acquirers
  2 = Unlikely, 7-10+ years
  3 = Low likelihood, few acquirers
  4 = Plausible but traction-dependent
  5 = Somewhat plausible, occasional acquihires
  6 = Likely acquihire outcomes
  7 = Reasonably likely, moderate acquirers
  8 = Strong likelihood, several acquirers
  9 = Very likely, many acquirers or IPO
  10 = Extremely likely, hot sector, fast exits

Overall dimension score = (Revenue × 3 + UnitEcon × 4 + Exit × 3) / 10`,
};

export async function scorerAgent(
  ctx: ResearchContext,
  dim: DimensionKey
): Promise<ScorerOutput> {
  const label = DIMENSION_LABELS[dim];
  const rubric = RUBRICS[dim];
  const context = serializeDimensionForScorer(ctx, dim);

  const systemPrompt = `You are an analyst evaluating a startup idea.
Your job is to score evidence and insights, and then map them to the scoring rubric below.

Interpret the signals — what they imply for risk, attractiveness, and differentiation.
Assign a score (1-10) per category and justify with qualitative reasoning.
Use the FULL 1-10 range. A 5 is average. Do not default to 6-7 out of caution — if the evidence is strong, score 8-10. If the evidence is weak, score 1-4.

Scoring Rubric for ${label}:
${rubric}

For each category in the rubric:
- Summarize specific evidence (Qual signals)
- Explain the meaning (Interpretation)
- Assign a score: X/10

Then calculate the overall dimension score using the WEIGHTED AVERAGE formula shown at the bottom of the rubric. Round to 1 decimal place.

Also provide:
- Justification paragraph
- Top 3 strengths
- Top 3 weaknesses
- Single most important risk

DO NOT add categories beyond what is listed in the rubric.`;

  const result = await runAgent<ScorerOutput>({
    systemPrompt,
    userPrompt: `${context}

Score the ${label} dimension based on the rubric. Return the overall dimension score, justification, strengths, weaknesses, and key risk.`,
    outputSchema: scorerSchema,
    maxTurns: 1,
    agentName: "scorer",
  });

  ctx.dimensions[dim].score = result;
  return result;
}
