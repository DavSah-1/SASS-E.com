-- Insert initial achievement badges for Learn Finance

INSERT INTO learning_badges (name, description, icon, tier, criteria) VALUES
-- Bronze Tier Badges (Getting Started)
('First Steps', 'Completed your first finance article', '👶', 'bronze', '{"type": "articles_completed", "count": 1}'),
('Quiz Rookie', 'Passed your first quiz', '📝', 'bronze', '{"type": "quizzes_passed", "count": 1}'),
('Dedicated Learner', 'Maintained a 3-day study streak', '🔥', 'bronze', '{"type": "study_streak", "days": 3}'),

-- Silver Tier Badges (Building Momentum)
('Knowledge Seeker', 'Completed 5 finance articles', '📚', 'silver', '{"type": "articles_completed", "count": 5}'),
('Quiz Master', 'Passed 5 quizzes', '✅', 'silver', '{"type": "quizzes_passed", "count": 5}'),
('Week Warrior', 'Maintained a 7-day study streak', '⚡', 'silver', '{"type": "study_streak", "days": 7}'),

-- Gold Tier Badges (Mastery Level)
('Tier 1 Complete', 'Completed all Tier 1 articles and quizzes', '🏆', 'gold', '{"type": "tier_completed", "tier": 1}'),
('Perfect Score', 'Achieved 100% on any quiz', '💯', 'gold', '{"type": "perfect_quiz", "count": 1}'),
('Month Master', 'Maintained a 30-day study streak', '🌟', 'gold', '{"type": "study_streak", "days": 30}'),

-- Platinum Tier Badges (Elite Achievements)
('Finance Expert', 'Completed all 7 tiers', '👑', 'platinum', '{"type": "all_tiers_completed"}'),
('Streak Legend', 'Maintained a 100-day study streak', '💎', 'platinum', '{"type": "study_streak", "days": 100}'),
('Perfect Scholar', 'Achieved 100% on 10 quizzes', '🎯', 'platinum', '{"type": "perfect_quiz", "count": 10}')
ON CONFLICT DO NOTHING;
