-- Create tier_assessments table
CREATE TABLE IF NOT EXISTS tier_assessments (
  id SERIAL PRIMARY KEY,
  tier_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  questions JSONB NOT NULL,
  pass_rate TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_tier_assessment_attempts table
CREATE TABLE IF NOT EXISTS user_tier_assessment_attempts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  tier_id INTEGER NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  passed TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tier_assessments_tier_id ON tier_assessments(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_tier_assessment_attempts_user_id ON user_tier_assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tier_assessment_attempts_tier_id ON user_tier_assessment_attempts(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_tier_assessment_attempts_user_tier ON user_tier_assessment_attempts(user_id, tier_id);

-- Enable RLS (Row Level Security)
ALTER TABLE tier_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tier_assessment_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tier_assessments (read-only for all authenticated users)
CREATE POLICY "Anyone can view tier assessments"
  ON tier_assessments
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_tier_assessment_attempts (users can only see their own attempts)
CREATE POLICY "Users can view their own tier assessment attempts"
  ON user_tier_assessment_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own tier assessment attempts"
  ON user_tier_assessment_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Insert Tier 1 assessment data
INSERT INTO tier_assessments (tier_id, title, description, questions, pass_rate)
VALUES (
  1,
  'Tier 1 Mastery Assessment: Prove You Know Your Financial Basics',
  'Time to prove you actually paid attention. This 10-question assessment covers everything from Tier 1. Score 80% or higher (8/10 correct) to unlock Tier 2. No pressure.',
  '[
    {
      "question_number": 1,
      "question_text": "In the 50/30/20 budgeting rule, which category should include your rent or mortgage payment?",
      "options": [
        "A. Wants (30%)",
        "B. Needs (50%)",
        "C. Savings/Debt (20%)",
        "D. It should be split between Needs and Wants",
        "E. It is not included in the 50/30/20 rule"
      ],
      "correct_answer": "B",
      "explanation": "Housing costs (rent/mortgage) are essential expenses and fall under the Needs category (50%). You cannot exactly skip paying rent and live in a cardboard box... well, you could, but that is not the point of budgeting.",
      "sass_correct": "Look at you, knowing where your biggest expense goes! Shocking.",
      "sass_incorrect": "Your rent is a NEED, not a want. Unless you think homelessness is a viable budgeting strategy."
    },
    {
      "question_number": 2,
      "question_text": "What is the core principle of zero-based budgeting?",
      "options": [
        "A. Spend nothing and save everything",
        "B. Only budget for necessities",
        "C. Assign every dollar a specific job until income minus expenses equals zero",
        "D. Eliminate all debt before creating a budget",
        "E. Save 50% of your income"
      ],
      "correct_answer": "C",
      "explanation": "Zero-based budgeting means giving every single dollar a job—whether it is paying bills, buying groceries, or funding your questionable online shopping habits. The goal is Income - Expenses - Savings = $0. Not negative zero (that is called debt), but I know exactly what I am doing with my money zero.",
      "sass_correct": "Correct! Every dollar gets a job. No freeloaders in your bank account.",
      "sass_incorrect": "Zero-based budgeting means EVERY dollar has a purpose. Not spend zero or save everything. Try again."
    },
    {
      "question_number": 3,
      "question_text": "The Envelope System is most effective for controlling which type of expenses?",
      "options": [
        "A. Fixed monthly bills like rent and utilities",
        "B. Variable spending categories like groceries and entertainment",
        "C. Investment contributions",
        "D. Debt payments",
        "E. Emergency fund savings"
      ],
      "correct_answer": "B",
      "explanation": "The Envelope System works best for variable expenses—the categories where you tend to overspend. You are not paying your landlord in cash like a drug dealer, but you can definitely control your grocery and entertainment spending by using physical envelopes (or their digital equivalent).",
      "sass_correct": "Exactly! Use envelopes for the spending you cannot seem to control. Like that daily coffee habit.",
      "sass_incorrect": "Wrong. You do not use envelopes for fixed bills. You use them for variable spending where you lose control."
    },
    {
      "question_number": 4,
      "question_text": "When choosing a checking account, which fee should you absolutely avoid?",
      "options": [
        "A. ATM fees at out-of-network machines",
        "B. Monthly maintenance fees",
        "C. Overdraft fees",
        "D. Wire transfer fees",
        "E. All of the above"
      ],
      "correct_answer": "E",
      "explanation": "The correct answer is ALL OF THEM. In 2026, there are plenty of banks offering free checking accounts with no monthly fees, no overdraft fees, and ATM fee reimbursements. If your bank is charging you just to hold your money, find a better bank. You are not a charity.",
      "sass_correct": "Yes! Avoid ALL unnecessary fees. Banks have enough money. They do not need yours.",
      "sass_incorrect": "Wrong. The answer is ALL OF THEM. Stop paying banks to hold your money. It is 2026, not 1950."
    },
    {
      "question_number": 5,
      "question_text": "What is the most important factor in determining your credit score?",
      "options": [
        "A. Your income level",
        "B. Payment history (35%)",
        "C. Credit utilization (30%)",
        "D. Length of credit history (15%)",
        "E. Your age"
      ],
      "correct_answer": "B",
      "explanation": "Payment history makes up 35% of your credit score—the biggest chunk. Paying your bills on time is literally the most important thing you can do for your credit. Miss payments? Your score tanks. Pay on time? Your score climbs. It is that simple.",
      "sass_correct": "Correct! Pay your bills on time. Revolutionary concept, I know.",
      "sass_incorrect": "Wrong. Payment history (35%) is the biggest factor. Paying bills on time matters more than anything else."
    },
    {
      "question_number": 6,
      "question_text": "How often can you request a free credit report from each of the three major credit bureaus?",
      "options": [
        "A. Once per month",
        "B. Once every 6 months",
        "C. Once per year",
        "D. Once every 2 years",
        "E. Only when you are denied credit"
      ],
      "correct_answer": "C",
      "explanation": "You can get one free credit report from each bureau (Equifax, Experian, TransUnion) once per year at AnnualCreditReport.com. That is the ONLY official site for free reports. Any other site is trying to sell you something or steal your identity. Pro tip: Request one report every 4 months (rotating bureaus) to monitor your credit year-round.",
      "sass_correct": "Correct! Once per year from each bureau. Use them wisely, or space them out every 4 months.",
      "sass_incorrect": "Wrong. It is once per year from EACH bureau. That is 3 free reports total if you space them out."
    },
    {
      "question_number": 7,
      "question_text": "Which of the following is an example of good debt?",
      "options": [
        "A. Credit card debt from a shopping spree",
        "B. A car loan for a luxury vehicle you cannot afford",
        "C. A student loan for education that increases earning potential",
        "D. A payday loan to cover rent",
        "E. All debt is bad debt"
      ],
      "correct_answer": "C",
      "explanation": "Good debt is debt that increases your net worth or earning potential over time. Student loans (for useful degrees), mortgages (building equity), and business loans (growing income) can be good debt. Credit card debt for stuff you do not need? That is bad debt. Payday loans? That is financial suicide.",
      "sass_correct": "Yes! Student loans for education that boosts your income = good debt. Credit cards for shoes = bad debt.",
      "sass_incorrect": "Wrong. Good debt increases your earning potential or net worth. Student loans for valuable education qualify."
    },
    {
      "question_number": 8,
      "question_text": "What is the main advantage of the Debt Avalanche method over the Debt Snowball method?",
      "options": [
        "A. It is easier to stick with long-term",
        "B. It provides more psychological wins",
        "C. It saves more money on interest",
        "D. It pays off more debts faster",
        "E. It requires less discipline"
      ],
      "correct_answer": "C",
      "explanation": "The Debt Avalanche (paying highest interest rate first) saves you the most money on interest. The Debt Snowball (paying smallest balance first) gives you psychological wins but costs more in interest. Avalanche = math-optimized. Snowball = emotion-optimized. Pick the one you will actually stick with.",
      "sass_correct": "Correct! Avalanche saves money on interest. Snowball saves your sanity. Both work if you stick with them.",
      "sass_incorrect": "Wrong. Avalanche (highest interest first) saves MORE money on interest. Snowball is for psychological wins."
    },
    {
      "question_number": 9,
      "question_text": "If you invest $1,000 at 8% annual interest compounded annually, approximately how much will you have after 10 years?",
      "options": [
        "A. $1,080",
        "B. $1,800",
        "C. $2,159",
        "D. $2,500",
        "E. $10,000"
      ],
      "correct_answer": "C",
      "explanation": "Using the compound interest formula: $1,000 × (1.08)^10 = $2,159. That is the magic of compound interest—your money makes money, and that money makes money. Over 10 years, your $1,000 more than doubles. Over 30 years? It becomes $10,063. Start investing early, and let compound interest do the heavy lifting.",
      "sass_correct": "Correct! $2,159. Compound interest is your money is superpower. Use it wisely.",
      "sass_incorrect": "Wrong. It is $2,159. Compound interest means your money grows exponentially, not linearly. Math matters."
    },
    {
      "question_number": 10,
      "question_text": "How many months of expenses should a fully-funded emergency fund cover?",
      "options": [
        "A. 1 month",
        "B. 3 months",
        "C. 3-6 months",
        "D. 6-12 months",
        "E. 12+ months"
      ],
      "correct_answer": "C",
      "explanation": "A fully-funded emergency fund should cover 3-6 months of essential expenses. If you have stable income and low expenses, 3 months is fine. If you are self-employed, have irregular income, or support a family, aim for 6 months. Start with $1,000, then build to 1 month, then 3-6 months. Baby steps.",
      "sass_correct": "Correct! 3-6 months is the gold standard. Adjust based on your job stability and risk tolerance.",
      "sass_incorrect": "Wrong. The standard is 3-6 months of expenses. Not 1 month (too risky), not 12+ months (overkill for most people)."
    }
  ]'::jsonb,
  '0.80'
)
ON CONFLICT DO NOTHING;
