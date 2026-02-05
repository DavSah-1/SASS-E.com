-- Learn Finance Schema for Supabase (PostgreSQL)

-- Finance Articles table
CREATE TABLE IF NOT EXISTS finance_articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  summary TEXT,
  content TEXT NOT NULL,
  "readTime" INTEGER NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  tags TEXT,
  author VARCHAR(200),
  published TEXT DEFAULT 'true' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User Learning Progress table
CREATE TABLE IF NOT EXISTS user_learning_progress (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "articleId" INTEGER NOT NULL,
  completed TEXT DEFAULT 'false' NOT NULL,
  progress INTEGER DEFAULT 0 NOT NULL,
  "lastAccessedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "completedAt" TIMESTAMP
);

-- Financial Glossary table
CREATE TABLE IF NOT EXISTS financial_glossary (
  id SERIAL PRIMARY KEY,
  term VARCHAR(200) NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  example TEXT,
  "relatedTerms" TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(50) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Learning Badges table
CREATE TABLE IF NOT EXISTS learning_badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100),
  tier VARCHAR(50) NOT NULL,
  criteria TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User Learning Badges table
CREATE TABLE IF NOT EXISTS user_learning_badges (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "badgeId" INTEGER NOT NULL,
  "earnedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE finance_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for finance_articles (public read, admin write)
CREATE POLICY "Anyone can read published articles" ON finance_articles
  FOR SELECT
  USING (published = 'true');

CREATE POLICY "Service role can manage articles" ON finance_articles
  FOR ALL
  USING (true);

-- RLS Policies for user_learning_progress (users see only their own)
CREATE POLICY "Users can view their own progress" ON user_learning_progress
  FOR SELECT
  USING ("userId" = auth.uid()::TEXT);

CREATE POLICY "Users can update their own progress" ON user_learning_progress
  FOR INSERT
  WITH CHECK ("userId" = auth.uid()::TEXT);

CREATE POLICY "Users can modify their own progress" ON user_learning_progress
  FOR UPDATE
  USING ("userId" = auth.uid()::TEXT);

-- RLS Policies for financial_glossary (public read)
CREATE POLICY "Anyone can read glossary terms" ON financial_glossary
  FOR SELECT
  USING (true);

-- RLS Policies for learning_badges (public read)
CREATE POLICY "Anyone can read badges" ON learning_badges
  FOR SELECT
  USING (true);

-- RLS Policies for user_learning_badges (users see only their own)
CREATE POLICY "Users can view their own badges" ON user_learning_badges
  FOR SELECT
  USING ("userId" = auth.uid()::TEXT);

CREATE POLICY "Users can earn badges" ON user_learning_badges
  FOR INSERT
  WITH CHECK ("userId" = auth.uid()::TEXT);
