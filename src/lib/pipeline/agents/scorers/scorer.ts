import { runAgent } from "../../runAgent";
import { scorerSchema } from "../../schemas";
import { ScorerOutput, ResearchContext, DimensionKey, DIMENSION_LABELS } from "../../types";
import { serializeDimensionForScorer } from "../../researchContext";

const RUBRICS: Record<DimensionKey, string> = {
  market_environment: `Categories:
1: TAM (Total Addressable Market)
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

2. Market Growth Rate
  1 = <2% (stagnant/declining)
  2 = 2%
  3 = 3%
  4 = 4%
  5 = 5-6%
  6 = 7-8%
  7 = 9-10%
  8 = 11-15%
  9 = 16-20%
  10 = >20%`,

  competition: `Categories:
1: Capital Raised by Competitors
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

2. Competitor Landscape
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

3. Ease of Copying / Moat
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

4. Winner-Takes-All Dynamics
  1 = Already won by incumbent
  2 = Emerging dominant leader
  3 = Consolidated, winner-takes-most
  4 = Strong leaders, but fragmented
  5 = Standard fragmented market
  6 = Fragmented, moderate concentration
  7 = Niche opening in WTA market
  8 = Wide opening in WTA, no leader
  9 = Strong WTA potential, unblocked
  10 = Unclaimed WTA proposition`,

  cost_difficulty: `Categories:
1. Capital Required (Initial Startup Cost)
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

2. Technology Required
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

3. GTM Difficulty
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

4. Land and Expand Potential
  1 = One-and-done sale
  2 = Very limited expansion
  3 = Limited recurring, occasional add-ons
  4 = Some expansion, not primary growth
  5 = Moderate upsell
  6 = Moderate recurring expansion
  7 = Strong upsell in accounts
  8 = Built-in expansion (seats, teams)
  9 = Multi-vector expansion
  10 = Continuous land/expand, usage-based`,

  product_need: `Categories:
1. Problem Urgency
  1 = No clear problem
  2 = Low priority, episodic
  3 = Nice-to-have
  4 = Moderate efficiency gain
  5 = Important, not urgent
  6 = Noticeable friction, modest WTP
  7 = High priority, real inefficiency/cost
  8 = Strong pain point, unlocks big value
  9 = Hair-on-fire problem for some
  10 = Critical mission-level painkiller`,

  financial_return: `Categories:
1. Exit Likelihood (3-5 Years)
  1 = Very unlikely, no acquirers
  2 = Unlikely, 7-10+ years
  3 = Low likelihood, few acquirers
  4 = Plausible but traction-dependent
  5 = Somewhat plausible, occasional acquihires
  6 = Likely acquihire outcomes
  7 = Reasonably likely, moderate acquirers
  8 = Strong likelihood, several acquirers
  9 = Very likely, many acquirers or IPO
  10 = Extremely likely, hot sector, fast exits`,
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
Assign a score (1-10) and justify with qualitative reasoning.

Scoring Rubric for ${label}:
${rubric}

For each category in the rubric:
- Summarize specific evidence (Qual signals)
- Explain the meaning (Interpretation)
- Assign a tentative score: X/10

Then provide:
- An overall dimension score (average of category scores, rounded to 1 decimal)
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
