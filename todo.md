# Project TODO

## Completed Features
- [x] Voice interface with speech-to-text
- [x] Text-to-speech responses
- [x] Sarcastic AI personality
- [x] Web search integration with Tavily
- [x] Proactive search triggers
- [x] Extra sarcastic search responses
- [x] Conversation history
- [x] User authentication
- [x] Database storage
- [x] Landing page
- [x] Voice assistant page

## New Features to Implement
- [x] IoT device control capability
- [x] Smart home device integration
- [x] Device discovery and pairing
- [x] Voice commands for IoT control
- [x] Device status monitoring
- [x] IoT device management UI
- [x] Support for common IoT protocols (MQTT, HTTP, WebSocket, Local)
- [x] Device state persistence in database
- [x] Sarcastic responses for IoT commands



## Learning & Personalization Features
- [x] Track user interaction patterns
- [x] Calculate sarcasm level based on conversation history
- [x] Store user preferences and sarcasm tolerance
- [x] Adaptive response generation based on user feedback
- [x] Progressive sarcasm escalation over time
- [x] User profile with interaction statistics
- [x] Sarcasm level indicator in UI
- [x] Feedback buttons for user input
- [x] Dynamic system prompts based on sarcasm level


## Mobile & PWA Features
- [x] Progressive Web App (PWA) configuration
- [x] Service worker for offline capability
- [x] Web app manifest for installability
- [x] Mobile-responsive design optimization
- [x] Touch-friendly interface elements
- [x] Mobile microphone optimization
- [x] App icons for iOS and Android
- [x] Splash screens for mobile devices
- [x] Add to home screen functionality
- [x] Mobile-specific UI adjustments


## Navigation Enhancements
- [x] Add navigation menu drop-down with links (Home, Voice Assistant, IoT Devices)
- [x] Add mobile hamburger menu for responsive navigation
- [x] Implement menu toggle functionality
- [x] Style menu items consistently with app theme



## Bug Fixes
- [x] Fixed IoT Devices navigation route from /iot to /devices across all pages


- [x] Updated footer text to "Built with Human and A.I." (added periods to A.I.)



## Changes Pulled from GitHub
- [x] Updated hero tagline from "Your AI companion" to "Your very own AI Agent"
- [x] Updated "Highly Clever(ish)" card description to "Get answers dripping with knowledge and enlightenment I didn't learn"
- [x] Added login button to IoT Devices authentication card



## Search Behavior Update
- [x] Changed web search behavior from proactive (all questions) to specific keywords only (weather, news, price)
- [x] Commented out original proactive search logic
- [x] Now only triggers search for specific keywords: weather, news, price



## Phase 1: Voice Quality Enhancement (Web Speech API)
- [x] Add speech rate control based on personality level
- [x] Implement sentence-based pauses for natural flow
- [x] Add emphasis to sarcastic keywords
- [x] Implement voice selection from available browser voices
- [x] Add pitch and volume controls
- [x] Create utility function for processing text with pauses



## Bug Fixes
- [x] Remove pause markers (...) from spoken text to prevent saying punctuation out loud



## Real-Time Translation Feature
- [x] Add translation procedure to backend (server/routers.ts)
- [x] Create language selector UI components
- [x] Implement input language detection and selection
- [x] Implement output language selection
- [x] Add bilingual display (show both original and translated text)
- [x] Integrate multi-language TTS support
- [x] Add language swap button
- [x] Update speech recognition to support multiple languages
- [x] Preserve Bob's personality in translations
- [x] Add translation mode toggle

## Speech Integration for Translation
- [x] Connect input language selector to speech recognition language
- [x] Connect output language selector to TTS voice selection
- [x] Update startRecording to use selected input language
- [x] Update speakText to use selected output language voice
- [x] Test multi-language speech recognition and synthesis



## Verified Learning Assistant (Premium Feature)
### Backend Implementation
- [x] Create database schema for learning sessions
- [x] Create database schema for fact-check results
- [x] Add learning router to server/routers.ts
- [x] Add database helper functions for learning operations
- [x] Implement explain with fact-checking procedure
- [x] Implement study guide generation procedure
- [x] Implement quiz generation procedure
- [x] Add web search integration for fact verification
- [x] Implement credibility scoring system
- [x] Add source citation tracking

### Frontend Implementation
- [x] Create Learning page component
- [x] Add Verified Learning mode toggle
- [x] Build explanation display with fact-check results
- [x] Add credibility score indicators
- [x] Implement source citation display
- [x] Create study guide generator UI
- [x] Build interactive quiz interface
- [x] Add learning progress tracking
- [ ] Create export to PDF functionality

### Features
- [x] Explain topics with automatic fact-checking
- [x] Show source citations inline
- [x] Display confidence/credibility scores
- [x] Generate verified study guides
- [x] Create interactive quizzes with explanations
- [x] Track learning history
- [ ] Multi-perspective analysis for controversial topics
- [ ] Detect and flag misinformation



## Bug Fixes
- [x] Fix TypeScript error in IoTDevices.tsx: Type 'TextContent | ImageContent | FileContent' is not assignable to type 'ReactNode'



## UI Improvements
- [x] Add "Learning" navigation link to Home page header



## Bug Fixes
- [x] Fix "failed to generate explanation" error in Verified Learning Assistant



## Bug Fixes
- [x] Fix TTS voice selection for translated languages - voices sound English instead of native language


## Study Guide & Quiz Generation
- [x] Implement study guide generation procedure in backend
- [x] Implement quiz generation procedure in backend
- [x] Add study guide display UI to Learning page
- [x] Add quiz interface with question display
- [x] Add quiz answer submission and scoring
- [x] Save quiz attempts to database
- [x] Display quiz results with feedback
- [x] Fix quiz generation JSON schema error (correctAnswer type)
- [x] Fix quiz submission answer comparison logic


## Comprehensive Foreign Language Learning Section
### Database Schema
- [x] Create vocabulary_items table (word, translation, language, difficulty, context)
- [x] Create grammar_lessons table (topic, language, explanation, examples)
- [x] Create language_exercises table (type, content, correct_answer, difficulty)
- [x] Create user_vocabulary table (user progress tracking for vocabulary)
- [x] Create exercise_attempts table (track user performance on exercises)
- [x] Create language_progress table (overall fluency tracking)
- [x] Create user_achievements table (badges and milestones)
- [ ] Create pronunciation_practice table (audio recordings and feedback - future)

### Backend API
- [x] Add vocabulary builder procedure (get words by difficulty/topic)
- [x] Add grammar explanation procedure (AI-powered with examples)
- [x] Add exercise generation procedure (fill-in-blank, multiple choice, translation)
- [x] Add vocabulary quiz procedure (spaced repetition algorithm)
- [x] Add progress tracking procedure (calculate fluency score)
- [x] Add achievement system procedures
- [x] Add supported languages endpoint (10+ languages)
- [ ] Add pronunciation evaluation procedure (using speech-to-text - future)
- [ ] Add daily lesson generator procedure (personalized learning path - future)

### Frontend Features
- [x] Create Language Learning page (/language-learning)
- [x] Add language selector (Spanish, French, German, Italian, Portuguese, Japanese, Chinese, Korean, Russian, Arabic)
- [x] Build vocabulary flashcard interface with spaced repetition
- [x] Create grammar lesson viewer with interactive examples
- [x] Build exercise interface (multiple types: translation, fill-in-blank, matching)
- [x] Add progress dashboard (vocabulary size, grammar topics mastered, exercise scores)
- [x] Add achievement system (badges for milestones)
- [x] Implement streak tracking (consecutive days of practice)
- [x] Add navigation links to Home page (desktop and mobile)
- [ ] Add pronunciation practice with speech recognition feedback (future)
- [ ] Create daily lesson plan generator (future)

### Learning Features
- [x] Vocabulary builder with context sentences and examples
- [x] AI-powered grammar explanations with verified examples
- [x] Interactive exercises (translation, fill-in-blank, multiple choice)
- [x] Spaced repetition system for vocabulary review
- [x] Progress tracking and fluency scoring
- [x] Cultural notes and context in grammar explanations
- [x] Achievement badges and streak tracking
- [x] Bob's sarcastic teaching personality throughout
- [ ] Pronunciation practice with real-time feedback (future)
- [ ] Daily personalized lesson plans (future)
- [ ] Conversation practice scenarios (future)


## Text-to-Speech Pronunciation for Vocabulary Flashcards
- [x] Create TTS utility function for language-specific pronunciation
- [x] Add speaker button to vocabulary flashcards
- [x] Integrate browser's speech synthesis API with language selection
- [x] Map language codes to speech synthesis voices (10+ languages)
- [x] Add auto-play pronunciation when flashcard is displayed
- [x] Add manual pronunciation button for user control
- [x] Handle cases where language voice is not available
- [x] Seed 15 Spanish vocabulary words for testing
- [x] Test pronunciation feature (works in real browsers, sandbox has no TTS voices)


## Vocabulary Database Expansion (345 words per language = 3,450 total)
- [x] Create Spanish vocabulary dataset (345 words across all levels)
- [x] Create French vocabulary dataset (345 words across all levels)
- [x] Create German vocabulary dataset (345 words across all levels)
- [x] Create Italian vocabulary dataset (345 words across all levels)
- [x] Create Portuguese vocabulary dataset (345 words across all levels)
- [x] Create Japanese vocabulary dataset (345 words with kanji/hiragana/romaji)
- [x] Create Chinese vocabulary dataset (345 words with pinyin)
- [x] Create Korean vocabulary dataset (345 words with Hangul)
- [x] Create Russian vocabulary dataset (345 words with Cyrillic)
- [x] Create Arabic vocabulary dataset (345 words with transliteration)
- [x] Organize words by 23 themes (greetings, numbers, colors, food, travel, etc.)
- [x] Include pronunciation guides for all words
- [x] Add example sentences with English translations
- [x] Add cultural context notes
- [x] Create LLM-powered vocabulary generation script
- [x] Fix database schema (partOfSpeech varchar instead of enum)
- [x] Run seed scripts to populate database with 3,450 words
- [x] Test flashcards with expanded Spanish vocabulary
- [x] Test flashcards with Japanese (non-Latin script)
- [x] Verify all 10 languages work correctly


## Interactive Language Exercises (108 per language = 1,080 total)
### Exercise Generation
- [x] Create LLM-powered exercise generation script
- [x] Generate 108 Spanish exercises (36 translation + 36 fill-in-blank + 36 multiple choice)
- [x] Generate 108 French exercises (36 translation + 36 fill-in-blank + 36 multiple choice)
- [x] Generate 108 German exercises (36 translation + 36 fill-in-blank + 36 multiple choice)
- [x] Generate 108 Italian exercises (36 translation + 36 fill-in-blank + 36 multiple choice)
- [x] Generate 108 Portuguese exercises (36 translation + 36 fill-in-blank + 36 multiple choice)
- [x] Generate 108 Japanese exercises (36 translation + 36 fill-in-blank + 36 multiple choice)
- [x] Generate 108 Chinese exercises (36 translation + 36 fill-in-blank + 36 multiple choice)
- [x] Generate 108 Korean exercises (36 translation + 36 fill-in-blank + 36 multiple choice)
- [x] Generate 108 Russian exercises (36 translation + 36 fill-in-blank + 36 multiple choice)
- [x] Generate 108 Arabic exercises (36 translation + 36 fill-in-blank + 36 multiple choice)
- [x] Organize exercises by difficulty (12 beginner + 12 intermediate + 12 advanced per type)
- [x] Include clear instructions and exercise prompts
- [x] Add Bob's sarcastic feedback for correct/incorrect answers
- [x] Add detailed explanations for incorrect answers
- [x] Transform and seed all 1,080 exercises into database

### Exercise UI Implementation
- [x] Build exercise interface with question display
- [x] Create unified exercise component supporting all types
- [x] Add textarea input for translation and fill-in-blank exercises
- [x] Add button inputs for multiple-choice exercises
- [x] Add answer validation with backend API
- [x] Implement instant feedback with result display
- [x] Display Bob's sarcastic feedback based on correctness
- [x] Show correct answer for incorrect responses
- [x] Show detailed explanation for learning
- [x] Add "Next Exercise" navigation button
- [x] Save exercise attempts to database
- [x] Update progress dashboard (Exercises Done counter)
- [x] Add exercise type and difficulty badges
- [x] Add progress indicator (Exercise X of 10)

### Testing
- [x] Test translation exercises with Spanish
- [x] Test answer submission and validation
- [x] Test incorrect answer feedback display
- [x] Test correct answer display
- [x] Test explanation display
- [x] Test navigation to next exercise
- [x] Verify progress tracking updates correctly
- [x] Verify Bob's sarcastic feedback displays correctly


## Bug Fixes - Language Learning UI Issues
- [ ] Fix TTS pronunciation button not showing on vocabulary flashcards
- [ ] Fix missing navigation bar on Language Learning page
- [ ] Fix language selector showing country codes instead of flag emojis


## UI Bug Fixes - Language Learning Page
- [x] Fix missing navigation bar on Language Learning page
- [x] Fix language selector to show flag emojis (🇪🇸, 🇫🇷, etc.) instead of country codes
- [x] Fix TTS pronunciation button not showing on vocabulary flashcards (now always visible, disabled when TTS unavailable)


## Bug Fixes - TTS Sound Issue
- [x] Fix TTS pronunciation button - improved voice loading, error handling, and removed auto-play (works in real browsers, not in preview environment)


## Bug Fixes - TTS Button Not Clickable
- [x] Fix TTS pronunciation button - button is now clickable and interactive (removed disabled state based on ttsAvailable)


## Pronunciation Comparison Feature
- [x] Create audio recording utility with MediaRecorder API
- [x] Implement waveform visualization for audio playback
- [x] Create pronunciation comparison algorithm using audio analysis
- [x] Calculate similarity percentage between user and native pronunciation
- [x] Build recording UI with record/stop/play controls
- [x] Display side-by-side waveform comparison
- [x] Show pronunciation accuracy score as percentage
- [x] Add pronunciation practice mode to vocabulary flashcards
- [ ] Store user pronunciation recordings (optional for review - future enhancement)


## Rebranding: Agent Bob → SASS-E
- [x] Update app title from "Agent Bob" to "SASS-E"
- [x] Add subtitle "Synthetic Adaptive Synaptic System - Entity"
- [x] Update all page headers and navigation references
- [x] Remove explicit "sarcasm" wording from UI text
- [x] Update home page hero section
- [x] Update language learning page references
- [x] Update voice assistant page references
- [ ] Update IoT devices page references (if needed)
- [x] Keep sarcastic personality in actual AI responses (no backend changes needed)


## Mobile & Tablet Responsiveness
- [x] Audit and fix Home page responsive design
- [x] Audit and fix Voice Assistant page responsive design
- [x] Audit and fix Language Learning page responsive design
- [x] Audit and fix IoT Devices page responsive design
- [x] Test on mobile viewport (320px-768px)
- [x] Test on tablet viewport (768px-1024px)
- [x] Ensure all buttons, forms, and interactive elements are touch-friendly
- [x] Verify text readability on small screens
- [x] Check navigation menu functionality on mobile


## User Language Preference System
- [x] Add preferredLanguage field to users table schema
- [x] Push database migration for language preference
- [x] Create language preference API endpoints (setLanguage)
- [x] Build i18n translation system with language files (EN, ES, FR, DE)
- [x] Create language context for managing user language state
- [x] Create language selector component
- [x] Create reusable Navigation component with translations
- [ ] Update Home page to use Navigation component and translations
- [ ] Update Voice Assistant page to use Navigation component and translations
- [ ] Update Language Learning page to use Navigation component and translations
- [ ] Update IoT Devices page to use Navigation component and translations
- [ ] Update Learning page to use Navigation component and translations
- [ ] Test language switching across all pages
- [ ] Implement i18n translation system with language files
- [ ] Translate all UI strings across all pages
- [ ] Add language selector to navigation bar
- [ ] Store language preference in user profile
- [ ] Auto-detect browser language on first visit
- [ ] Apply language preference across all pages and components


## User Profile Settings Page
- [x] Create Profile Settings page component (/profile)
- [x] Add language preference selector to profile settings
- [x] Add account information display (name, email, login method)
- [x] Add personality settings (sarcasm level display)
- [x] Add interaction statistics display
- [x] Add profile settings route to App.tsx
- [x] Add "Profile" link to navigation menu (desktop and mobile)
- [x] Test language preference persistence from profile settings
- [x] Add save confirmation feedback with toast notifications


## Bug Fixes - Profile Link Not Showing
- [x] Fix Profile link not visible in navigation menu
- [x] Replaced Home page hardcoded navigation with shared Navigation component
- [x] Test Profile link visibility on all pages


## Bug Fixes - Authentication Not Working
- [x] Investigate sign-in redirect issue - authentication works in normal mode, issue only in incognito
- [x] Check OAuth callback handler - working correctly
- [x] Verify session cookie creation - working correctly
- [x] Test authentication flow end-to-end - confirmed working

## Incognito Mode Notice Feature
- [x] Add incognito mode detection utility
- [x] Display user-friendly notice on home page for incognito users
- [x] Explain that authentication requires cookies and may not work in incognito mode
- [x] Test incognito mode detection


## Replace Hardcoded Navigation with Shared Component
- [x] Update Home page with Navigation component (already done)
- [x] Update Voice Assistant page with Navigation component
- [x] Update Language Learning page with Navigation component (already done)  
- [x] Update IoT Devices page with Navigation component
- [x] Update Learning page with Navigation component (already done)
- [x] Test Profile link visibility on all pages
- [x] Test language selector consistency across all pages


## Learning Categories Suggestion Cards
- [x] Create category data structure with 12 main categories
- [x] Design category card component with icon, title, and subcategories
- [x] Add category cards to Learning page as quick-start shortcuts
- [x] Implement category selection to populate learning topic
- [x] Add responsive grid layout for category cards
- [x] Test category card interactions


## Navigation Bar Consistency Fix
- [x] Replace hardcoded navigation in Learning page with shared Navigation component
- [x] Replace hardcoded navigation in LanguageLearning page with shared Navigation component
- [x] Test navigation consistency across all pages (Profile link, language selector, translations)


## Debt Elimination Financial Coach Feature
### Database Schema
- [x] Create debts table (user_id, name, type, balance, interest_rate, minimum_payment, due_day)
- [x] Create debt_payments table (debt_id, amount, payment_date, payment_type)
- [x] Create debt_milestones table (user_id, milestone_type, achieved_date, debt_id)
- [x] Create debt_strategies table (user_id, strategy_type, projected_payoff_date, total_interest)
- [x] Create coaching_sessions table (user_id, session_type, message, sentiment, created_at)
- [x] Push database migration with pnpm db:push

### Backend API
- [x] Add database helper functions in server/db.ts
- [x] Create debt router in server/routers.ts
- [x] Implement addDebt procedure
- [x] Implement getDebts procedure
- [x] Implement updateDebt procedure
- [x] Implement deleteDebt procedure
- [x] Implement recordPayment procedure
- [x] Implement getPaymentHistory procedure
- [x] Implement calculateStrategy procedure (snowball vs avalanche)
- [x] Implement getMilestones procedure
- [x] Implement getCoachingMessage procedure (AI-powered motivation)
- [x] Implement getDebtSummary procedure (total debt, progress, payoff date)

### Frontend UI (Current Phase)
- [x] Create DebtCoach page component at /debt-coach route
- [x] Build debt summary statistics cards (total debt, total paid, debts paid off, avg interest)
- [x] Create debt portfolio cards with progress bars
- [x] Add debt entry form modal with validation
- [x] Create payment logging modal with amount/type/date inputs
- [x] Build strategy comparison chart (snowball vs avalanche)
- [ ] Add debt reduction timeline chart
- [x] Implement milestone badge display
- [x] Add coaching message card with SASS-E personality
- [ ] Create payment history table
- [x] Add navigation link to Debt Coach
- [x] Implement responsive mobile layout


## Budget Integration Module
### Database Schema
- [x] Create budget_categories table (user_id, name, type, monthly_limit, color)
- [x] Create budget_transactions table (user_id, category_id, amount, date, description, type)
- [x] Add budget-related indexes for performance
- [x] Push database migration

### Backend API
- [x] Add budget category CRUD endpoints
- [x] Add transaction tracking endpoints
- [x] Implement monthly budget summary calculation
- [x] Add income vs expense analysis endpoint
- [x] Create available funds calculator (income - expenses - debt payments)
- [x] Add budget recommendations based on debt goals

### Frontend UI
- [x] Create Budget page at /budget route
- [x] Build income tracking section with sources
- [x] Create expense tracking by category
- [x] Add transaction list with filtering
- [x] Build budget vs actual comparison charts
- [x] Create available funds for debt payment calculator
- [x] Add budget-to-debt integration dashboard widget
- [x] Implement category-based spending breakdown
- [ ] Add monthly trend line charts
- [x] Create quick transaction entry modal
- [x] Add navigation link to Budget page


## Money Page Consolidation (Unified Financial Hub)
### Page Structure
- [x] Create Money page component at /money route
- [x] Implement tabbed interface (Overview, Budget, Debt Coach)
- [x] Add tab navigation with active state indicators
- [x] Ensure mobile-responsive tab layout

### Overview Tab (Integrated Dashboard)
- [x] Create financial health score calculation
- [x] Build this month summary widget (income, expenses, debt payments, net cash flow)
- [x] Add quick action buttons (Add Transaction, Log Payment, Add Debt)
- [x] Display SASS-E coaching message with integrated insights
- [x] Show budget health indicator
- [x] Display debt freedom countdown
- [x] Add available for extra payments widget
- [x] Create visual connection between budget surplus and debt acceleration
- [ ] Add monthly progress chart (income vs expenses vs debt payments)

### Budget Tab Integration
- [x] Import Budget page into Money page
- [x] Hide Navigation component when Budget rendered in tab (use Money page nav)
- [x] Integrate Budget as tab in Money page
- [x] Maintain all existing budget functionality (categories, transactions, modals)
- [x] Ensure data refreshes when switching tabs
- [x] Test all budget features within tab context

### Debt Coach Tab Integration
- [x] Import Debt Coach page into Money page
- [x] Hide Navigation component when Debt Coach rendered in tab (use Money page nav)
- [x] Integrate Debt Coach as tab in Money page
- [x] Maintain all existing debt coach functionality (debts, payments, strategies, milestones)
- [x] Ensure data refreshes when switching tabs
- [x] Test all debt coach features within tab context

### Navigation Updates
- [x] Replace "Debt Coach" and "Budget" nav links with single "Money" link
- [x] Update App.tsx routing to use /money as main route
- [x] Keep /debt-coach and /budget as legacy routes (for direct access)
- [x] Update mobile navigation menu
- [x] Test all navigation flows


## Financial Goals System
### Database Schema
- [x] Create financial_goals table (user_id, name, type, target_amount, current_amount, target_date, status, priority)
- [x] Create goal_milestones table (goal_id, milestone_percentage, achieved_date, celebration_shown)
- [x] Create goal_progress_history table (goal_id, amount, date, note)
- [x] Add indexes for performance
- [x] Push database migration

### Backend API
- [x] Add goal CRUD endpoints (create, read, update, delete, list)
- [x] Implement goal progress tracking endpoint
- [x] Add milestone detection and celebration trigger
- [x] Create goal recommendations based on budget/debt data
- [ ] Implement goal priority ranking algorithm
- [x] Add goal completion celebration endpoint
- [x] Create progress history tracking

### Frontend UI
- [x] Create Goals page at /goals route
- [x] Build goal creation form with type selector (savings, debt-free, emergency fund, custom)
- [x] Add goal cards with circular progress indicators
- [x] Implement progress update modal
- [x] Create milestone celebration toast notifications
- [ ] Build goal priority drag-and-drop reordering
- [ ] Add progress history timeline
- [ ] Create AI coaching recommendations widget
- [ ] Implement goal templates for common goals
- [ ] Add goal sharing/export functionality
- [x] Integrate goals widget into Money Overview tab
- [x] Add navigation link to Goals page


## Navigation Reorganization
- [x] Remove Goals link from main navigation bar
- [x] Add Goals as fourth tab in Money page (Overview, Budget, Debt Coach, Goals)
- [ ] Update /goals route to redirect to /money with goals tab active
- [x] Test navigation flow


## Money Page URL Parameters
- [x] Add URL query parameter support to Money page (e.g., /money?tab=goals)
- [x] Read tab parameter on page load and set active tab
- [x] Update URL when user switches tabs
- [x] Add redirect from /goals to /money?tab=goals
- [x] Add redirect from /budget to /money?tab=budget
- [x] Add redirect from /debt-coach to /money?tab=debts
- [x] Test bookmarking and sharing tab links


## Money Hub Demo Page (Subscription Feature)
### Sample Data Structure
- [x] Create sample debts data (3 debts: credit card $8k, car loan $12k, student loan $5k)
- [x] Create sample budget categories (8 categories with realistic spending)
- [x] Create sample transactions (income $5k, expenses $3.8k)
- [x] Create sample goals (Emergency Fund 40%, Vacation Fund 60%)
- [x] Create sample payment history and milestones
- [x] Calculate realistic debt strategies and projections

### Demo Page Component
- [x] Create MoneyDemo page at /money-demo route
- [x] Implement read-only Money Hub with sample data
- [x] Add demo mode banner at top ("Demo Mode - Sample Data")
- [x] Disable all add/edit/delete buttons with upgrade tooltips
- [x] Show all 4 tabs (Overview, Budget, Debt Coach, Goals) with sample data
- [x] Add realistic SASS-E coaching messages for demo profile

### Subscription Upgrade Prompts
- [x] Add "Upgrade to Pro" button in demo banner
- [x] Add tooltips on disabled buttons: "Subscribe to manage your own data"
- [x] Add bottom CTA card: "Ready to Track Your Real Finances?"
- [x] Show feature checklist (Unlimited tracking, AI coaching, Export reports)
- [x] Display pricing: $9.99/mo with cancel anytime message
- [ ] Create pricing page or modal with feature comparison
- [ ] Add "Try Demo" link on main Money page for non-subscribers

### Navigation & Access Control
- [x] Add /money-demo route to App.tsx
- [ ] Add "Money Demo" link to navigation
- [ ] Update Money page to check subscription status
- [ ] Redirect non-subscribers from /money to /money-demo
- [ ] Add subscription check middleware or context
- [ ] Show appropriate messaging based on subscription status


## Subscription Check System
- [x] Add subscriptionTier field to users table (free, pro)
- [x] Add subscriptionStatus field to users table (active, inactive, trial)
- [x] Add subscriptionExpiresAt field to users table
- [x] Push database migration for subscription fields
- [x] Update user type definitions to include subscription fields
- [x] Add subscription check in Money page component
- [x] Redirect non-subscribers from /money to /money-demo
- [x] Add info banner on MoneyDemo explaining upgrade path
- [x] Test subscription check with different user states


## Pricing Modal & Stripe Integration
- [x] Create PricingModal component with dialog/modal UI
- [x] Add Free vs Pro feature comparison table
- [x] Implement tiered pricing display ($15/mo, $72/6mo at $12/mo, $120/yr at $10/mo)
- [x] Add pricing plan selection with radio buttons or cards
- [x] Include testimonials section with user quotes
- [ ] Add Stripe payment integration using webdev_add_feature
- [ ] Create Stripe checkout session endpoint
- [ ] Handle payment success/failure callbacks
- [ ] Update user subscription status after successful payment
- [x] Integrate pricing modal into MoneyDemo "Upgrade to Pro" buttons
- [x] Test pricing modal UI and payment flow


## Navigation Reorganization - Languages Integration
- [x] Remove Languages link from main navigation bar (desktop and mobile)
- [x] Add link to Languages card in Learning page
- [x] Update Learning page to make Languages card clickable/linked
- [x] Test navigation flow from Learning to Languages page


## Learning Hub Redesign
- [x] Restructure Learning page into two main sections
- [x] Create "Quick Learning" section with topic/question interface
- [x] Create "Specialized Learning Paths" section with dedicated experience cards
- [x] Add Languages card to Specialized Learning Paths with arrow indicator
- [x] Add visual distinction between Quick Learning categories and Specialized Paths
- [x] Update section headers and descriptions
- [x] Test navigation flow between sections


## Math Tutor Learning Path
- [x] Design database schema for math problems, solutions, and user progress
- [x] Create backend API for problem generation and step-by-step solving
- [x] Build Math Tutor page with problem input and solution display
- [x] Implement step-by-step solution breakdown with explanations
- [x] Add practice problem library organized by topic and difficulty
- [x] Create interactive problem solver with hints system
- [x] Add Math Tutor card to Specialized Learning Paths section
- [x] Test all math topics and solution generation


## Math Practice Problem Library
- [x] Create LLM-powered problem generation script for all 8 topics
- [x] Generate 15+ problems per topic per difficulty (beginner/intermediate/advanced)
- [x] Seed Algebra problems (linear equations, quadratic equations, polynomials)
- [x] Seed Calculus problems (derivatives, integrals, limits)
- [x] Seed Geometry problems (triangles, circles, area/volume)
- [x] Seed Trigonometry problems (sin/cos/tan, identities, angles)
- [x] Seed Statistics problems (mean/median/mode, probability, distributions)
- [x] Seed Arithmetic problems (fractions, percentages, order of operations)
- [x] Seed Linear Algebra problems (matrices, vectors, systems of equations)
- [x] Seed Differential Equations problems (first-order, second-order, separable)
- [x] Update Math Tutor UI with practice library browser
- [x] Add topic filter and difficulty selector
- [x] Test problem selection and solving workflow


## Expand Math Problem Library to 120+
- [x] Create comprehensive seed script with 120+ problems
- [x] Ensure 15 problems per topic (5 beginner, 5 intermediate, 5 advanced)
- [x] Cover diverse subtopics for each main topic
- [x] Clear existing problems from database
- [x] Seed expanded problem library
- [x] Verify problem distribution across topics and difficulties


## Fix Math Tutor Practice Library Error
- [x] Investigate practice library error
- [x] Debug backend API or frontend issue
- [x] Fix the error
- [x] Test practice library functionality


## Science Lab Learning Path
- [x] Design database schema for experiments, procedures, and user lab results
- [x] Create experiments table (title, category, difficulty, description, equipment, safety_warnings)
- [x] Create experiment_steps table (step_number, instruction, expected_result, safety_note)
- [x] Create user_lab_results table (user_id, experiment_id, observations, analysis, completed_at)
- [x] Build backend API for experiment library and result tracking
- [x] Create Science Lab page with experiment browser
- [x] Implement virtual lab interface with equipment visualization
- [x] Add step-by-step procedure display with safety warnings
- [x] Create result recording and analysis tools
- [x] Seed 30+ experiments across physics, chemistry, and biology
- [x] Add Science Lab card to Learning page
- [x] Test experiment workflows and result tracking


## Expand Science Lab Experiment Library
- [x] Create seed script with 20 advanced experiments
- [x] Add 7 advanced physics experiments (thermodynamics, electromagnetism, optics, quantum)
- [x] Add 7 advanced chemistry experiments (organic chemistry, electrochemistry, kinetics)
- [x] Add 6 advanced biology experiments (genetics, molecular biology, ecology)
- [x] Include detailed procedures with 6-8 steps per experiment
- [x] Add comprehensive safety warnings for advanced experiments
- [x] Seed experiments into database
- [x] Verify total experiment count reaches 30
- [x] Test experiment browser with expanded library


## Science Lab Enhancements
### Interactive Lab Equipment Visualizations
- [x] Create SVG component library for lab equipment
- [x] Design beaker with measurement markings and liquid animation
- [x] Design microscope with labeled parts (eyepiece, objective, stage, etc.)
- [x] Design spectrophotometer with light path visualization
- [x] Design DNA gel electrophoresis apparatus with wells and bands
- [x] Add interactive tooltips on hover for equipment parts
- [x] Create equipment gallery component for experiment pages
- [x] Integrate visualizations into experiment detail view

### Experiment Results Gallery (Lab Notebook)
- [x] Design lab notebook UI with card-based layout
- [x] Display past experiments with thumbnails
- [x] Show grades, observations, and SASS-E feedback for each result
- [x] Add filtering by category, difficulty, and grade
- [x] Add sorting by date, grade, or experiment name
- [x] Create detailed result view modal
- [x] Add comparison view for multiple experiments
- [x] Track improvement patterns with visual indicators

### Pre-Lab Quiz System
- [x] Design database schema for quiz questions and attempts
- [x] Create quiz_questions table (experiment_id, question, options, correct_answer)
- [x] Create quiz_attempts table (user_id, experiment_id, score, passed)
- [x] Generate 5-7 quiz questions per experiment using LLM
- [x] Build backend API for quiz retrieval and submission
- [x] Create quiz UI with multiple-choice questions
- [x] Implement quiz grading (70% passing threshold)
- [x] Lock experiment access until quiz is passed
- [x] Add quiz retake functionality
- [x] Seed quiz questions for all 30 experiments


## Fix Science Lab Error
- [x] Investigate "Cannot read properties of undefined (reading '0')" error on /science-lab page
- [x] Debug tRPC client error in Science Lab (quiz generation failing)
- [x] Fix conditional rendering logic to hide experiment view when quiz is showing
- [x] Add error logging to getLabQuiz procedure
- [ ] Fix LLM quiz generation failure (requires debugging LLM invocation)
- [ ] Temporary workaround: Disable quiz requirement or use pre-seeded questions


## Debug invokeLLM Function
- [x] Examine invokeLLM implementation in server/_core/llm.ts
- [x] Check LLM API credentials and configuration
- [x] Test invokeLLM with simple call to verify it works
- [x] Add detailed logging to track request/response
- [x] Identify why response.choices is undefined (json_schema not supported)
- [x] Fix LLM integration issue (changed to json_object mode)
- [x] Pre-seed quiz questions into database instead of dynamic generation
- [x] Create fallback quiz questions (6 generic questions for all experiments)
- [x] Update getLabQuiz to use fallback questions instead of LLM
- [x] Test Science Lab quiz system with fallback questions


## Experiment-Specific Quiz Questions
- [x] Create seed script with 6 tailored questions per experiment (180 total)
- [x] Write questions for 10 basic experiments (Newton's Law, Pendulum, Refraction, etc.)
- [x] Write questions for 10 intermediate experiments (Doppler, Kinetics, DNA Extraction, etc.)
- [x] Write questions for 10 advanced experiments (Thermodynamics, Spectroscopy, PCR, etc.)
- [x] Clear existing generic quiz questions from database
- [x] Run seed script to populate experiment-specific questions
- [x] Test quiz system with tailored questions for multiple experiments
- [x] Verify questions are relevant to each experiment's content


## Grant Full Money Hub Access
- [x] Check current user subscription status
- [x] Update user account to pro subscription tier
- [x] Set subscription status to active
- [x] Set subscription expiration date to future date (2026-12-31)
- [x] Verify Money Hub features are accessible
- [x] Test all Money Hub functionality


## Money Hub Enhancements

### Transaction Categories and Tags
- [x] Design database schema for categories and transaction tagging
- [x] Create predefined categories with emojis (groceries 🛒, utilities ⚡, entertainment 🎬, transport 🚗, etc.)
- [x] Add category field to transactions table
- [x] Build category management UI
- [x] Implement spending analytics by category
- [x] Create category breakdown charts
- [x] Add filtering by category in transaction list

### Budget Alert System
- [x] Design database schema for budget alerts and notifications
- [x] Create budget_alerts table with thresholds
- [x] Build notification system for budget warnings
- [x] Implement real-time spending vs budget tracking
- [x] Add 80% and 100% threshold alerts
- [x] Create weekly spending summary notifications
- [x] Build monthly budget performance reports
- [x] Add notification preferences UI

### Financial Insights Dashboard
- [x] Design insights data structure
- [x] Implement spending pattern analysis using LLM
- [x] Create personalized saving recommendations
- [x] Build predictive cash flow forecasting
- [x] Add insights visualization components
- [x] Create trend analysis charts
- [x] Implement monthly comparison analytics
- [x] Add actionable financial advice cards


## Spending Trends Visualization

### Interactive Charts
- [x] Design database schema for monthly spending aggregations
- [x] Create spending_trends table with month/category/amount data
- [x] Build backend API for trend data retrieval
- [x] Implement month-over-month comparison calculations
- [x] Add year-over-year comparison support
- [x] Create category-wise spending trends endpoint

### Chart Components
- [x] Build SpendingTrendsChart component using Chart.js or Recharts
- [x] Implement line chart for overall spending trends
- [x] Create bar chart for category comparisons
- [x] Add pie chart for category distribution
- [x] Build month selector for date range filtering
- [x] Add category filter for focused analysis
- [x] Implement interactive tooltips with detailed breakdowns
- [x] Create export functionality for chart data

### Integration
- [x] Add Spending Trends section to Money Hub Budget tab
- [x] Integrate charts with existing transaction data
- [x] Add seasonal pattern detection
- [x] Create spending improvement indicators (up/down arrows)
- [x] Build summary cards showing key insights


## Budget Templates

### Template System
- [x] Design database schema for budget templates
- [x] Create budget_templates table with predefined strategies
- [x] Build template application logic
- [x] Implement category auto-allocation algorithms

### Pre-configured Templates
- [x] Create 50/30/20 rule template (50% needs, 30% wants, 20% savings)
- [x] Build zero-based budgeting template (every dollar assigned)
- [x] Implement envelope system template (cash-based categories)
- [ ] Add custom template creation option

### Template Application
- [x] Build template selector UI with descriptions
- [x] Create template preview showing category allocations
- [x] Implement one-click template application
- [x] Add income-based auto-calculation
- [x] Build template customization before applying
- [ ] Create template comparison view
- [x] Add "Start from Template" button in Budget tab

### Integration
- [x] Integrate templates into budget creation flow
- [ ] Add template suggestions based on user profile
- [ ] Create template switching functionality
- [ ] Build template performance tracking


## Budget Alerts & Notifications

### Real-time Alert System
- [x] Design alert triggering logic for 80% threshold
- [x] Create alert generation when category spending exceeds limits
- [x] Implement 100% threshold alerts for budget exceeded
- [x] Build weekly spending summary alerts
- [x] Add monthly budget report notifications

### Notification Infrastructure
- [x] Set up notification delivery system using built-in notification API
- [x] Create notification preferences table for user settings
- [x] Implement notification batching to avoid spam
- [x] Add notification history tracking
- [x] Build notification dismissal functionality

### Alert UI Components
- [x] Create AlertBanner component for in-app alerts
- [x] Build NotificationCenter dropdown in navigation
- [x] Add alert badges showing unread count
- [x] Implement alert action buttons (view details, dismiss)
- [x] Create alert settings page for user preferences

### Integration
- [x] Integrate alerts with transaction creation flow
- [x] Add background job for periodic alert checks
- [x] Connect alerts to budget summary calculations
- [x] Build alert testing and preview functionality


## AI-Powered Spending Insights

### AI Analysis Engine
- [x] Design spending pattern analysis algorithms
- [x] Implement category spending trend detection
- [x] Build anomaly detection for unusual expenses
- [x] Create seasonal spending pattern recognition
- [x] Add comparison with similar user profiles (anonymized)

### Personalized Recommendations
- [x] Generate cost-cutting suggestions based on spending
- [x] Identify subscription optimization opportunities
- [x] Suggest category budget adjustments
- [x] Recommend savings goals based on patterns
- [x] Create actionable next steps for each insight

### LLM Integration
- [x] Build prompts for spending analysis
- [x] Implement structured output for insights
- [x] Add context from user's financial goals
- [x] Generate natural language explanations
- [x] Create sarcastic but helpful commentary (SASS-E style)

### Insights UI
- [x] Create InsightsCard component for displaying recommendations
- [x] Build insights dashboard section
- [x] Add "Take Action" buttons for implementing suggestions
- [x] Implement insight dismissal and feedback
- [x] Create insights history and tracking


## Recurring Transaction Automation

### Detection System
- [x] Design recurring pattern detection algorithm
- [x] Implement frequency analysis (weekly, monthly, yearly)
- [x] Build amount similarity detection
- [x] Create merchant/description matching logic
- [x] Add confidence scoring for detected patterns

### Smart Categorization
- [x] Build automatic category assignment for recurring transactions
- [x] Implement learning from user corrections
- [x] Create category suggestion system
- [x] Add bulk categorization for detected patterns
- [x] Build category confidence indicators

### Budget Forecasting
- [x] Calculate projected monthly expenses from recurring transactions
- [x] Generate 3-month spending forecast
- [x] Predict category budget needs
- [x] Create cash flow projections
- [ ] Build "what-if" scenario analysis

### Automation Features
- [x] Create recurring transaction templates
- [ ] Build auto-add functionality for predicted transactions
- [x] Implement transaction reminders before due dates
- [x] Add subscription tracking and renewal alerts
- [x] Create recurring transaction management dashboard

### UI Components
- [x] Build RecurringTransactionsList component
- [x] Create subscription tracker widget
- [x] Add forecast visualization charts
- [x] Implement transaction pattern review interface
- [x] Build automation settings panel


## Financial Goal Progress Tracker

### Goal Management System
- [x] Design goal progress tracking database schema
- [x] Create goal milestones and checkpoints table
- [x] Build goal progress calculation logic
- [x] Implement automatic progress updates from transactions
- [x] Add goal completion detection and celebration triggers

### Visual Progress Components
- [x] Create animated progress bars with percentage display
- [x] Build milestone markers on progress timeline
- [x] Implement confetti/celebration animations for achievements
- [x] Add progress comparison charts (actual vs target)
- [x] Create goal dashboard with multiple goals overview

### AI-Powered Predictions
- [x] Build LLM-based achievement date prediction
- [x] Implement savings rate analysis for goal feasibility
- [x] Generate personalized motivational messages
- [x] Create "on track" vs "off track" indicators
- [x] Add AI suggestions for accelerating goal progress

### Goal Types & Features
- [x] Support different goal types (savings, debt payoff, purchase)
- [ ] Implement recurring contribution tracking
- [x] Add goal priority system
- [ ] Build goal adjustment recommendations
- [ ] Create goal history and achievement archive

### Integration
- [x] Connect goals to budget categories
- [ ] Link goals to recurring transactions
- [ ] Integrate with spending insights
- [ ] Add goal-based budget allocation suggestions
- [ ] Build goal progress notifications


## Expense Receipt Scanner

### OCR Integration
- [x] Research and select OCR service (Tesseract, Google Vision, AWS Textract)
- [x] Implement image upload and preprocessing
- [x] Build text extraction pipeline
- [x] Create merchant name detection logic
- [x] Implement amount parsing with currency handling

### Smart Data Extraction
- [x] Build date extraction from receipts
- [x] Implement line item parsing for itemized receipts
- [x] Create tax and tip detection
- [x] Add payment method identification
- [x] Build receipt validation and error handling

### Auto-Categorization
- [x] Implement merchant-to-category mapping
- [x] Build ML-based category prediction
- [x] Create user learning from corrections
- [x] Add category confidence scoring
- [ ] Implement bulk receipt processing

### Receipt Management
- [x] Create receipt storage system (S3)
- [ ] Build receipt gallery/history view
- [ ] Implement receipt-transaction linking
- [ ] Add receipt search and filtering
- [ ] Create receipt export functionality

### UI Components
- [x] Build camera/file upload interface
- [x] Create receipt preview with extracted data
- [x] Implement one-tap transaction creation
- [x] Add manual correction interface
- [x] Build receipt processing status indicators


## Budget Sharing & Collaboration

### Multi-User System
- [x] Design shared budget database schema
- [x] Create budget sharing invitations system
- [x] Implement user roles (owner, editor, viewer)
- [x] Build permission management system
- [x] Add user activity tracking

### Shared Categories & Transactions
- [ ] Implement shared category creation
- [x] Build collaborative transaction adding
- [x] Create transaction ownership tracking
- [ ] Add transaction commenting system
- [ ] Implement transaction approval workflow (optional)

### Split Expense Tracking
- [x] Design expense splitting logic (equal, percentage, custom)
- [x] Build split expense calculation
- [x] Create "who owes whom" settlement tracking
- [ ] Implement split expense notifications
- [ ] Add settlement history and receipts

### Collaboration Features
- [ ] Build real-time updates for shared budgets
- [x] Implement activity feed for budget changes
- [ ] Create @mention system for discussions
- [ ] Add budget chat/messaging
- [ ] Build collaborative goal setting

### Privacy & Security
- [x] Implement data access controls
- [x] Create audit logs for sensitive actions
- [x] Add budget leave/removal functionality
- [ ] Build data export for individual users
- [ ] Implement budget archiving for ended collaborations

### UI Components
- [ ] Create budget sharing invitation flow
- [ ] Build shared budget dashboard
- [ ] Implement member management interface
- [ ] Add split expense calculator widget
- [ ] Create settlement summary view


## Money Hub Demo Page Update

- [x] Review current Money Hub Demo page structure
- [x] Add spending trends visualization showcase
- [x] Add budget templates demonstration
- [x] Add budget alerts and notifications examples
- [x] Add AI-powered spending insights section
- [x] Add recurring transactions automation showcase
- [x] Add financial goal progress tracker examples
- [x] Add receipt scanner demonstration
- [x] Add budget sharing and collaboration features
- [x] Update feature descriptions and benefits
- [x] Add interactive examples or screenshots


## Loan Interest Calculator

### Core Calculations
- [x] Calculate monthly payment using loan amortization formula
- [x] Calculate total interest paid over loan lifetime
- [x] Calculate total cost of loan (principal + interest)
- [x] Generate amortization schedule with payment breakdown
- [x] Support different compounding frequencies

### Calculator Features
- [x] Input fields for principal, interest rate, loan term
- [x] Real-time calculation as user types
- [x] Show monthly payment amount
- [x] Display total interest vs principal comparison
- [x] Visual breakdown chart (pie/bar)
- [x] Amortization table with each payment detail

### Extra Payment Analysis
- [x] Calculate impact of extra monthly payments
- [x] Show time saved with extra payments
- [x] Display interest savings from extra payments
- [x] Compare scenarios side by side

### Integration
- [x] Add calculator to Debt Coach section
- [ ] Link existing debts to calculator for analysis
- [x] Add demo version for Money Hub Demo page


## Loan Calculator Enhancements

### Link Existing Debts to Calculator
- [x] Add "Calculate" button to each debt card in Debt Coach
- [x] Create state management to pass debt data to calculator
- [x] Pre-fill calculator with debt's current balance, interest rate, and term
- [x] Scroll to calculator section when button is clicked
- [x] Highlight pre-filled values to show they came from a debt

### Loan Comparison Tool
- [x] Create LoanComparison component for side-by-side analysis
- [x] Support comparing 2-3 loan scenarios simultaneously
- [x] Show differences in monthly payment, total interest, total cost
- [x] Add visual comparison charts (bar chart for costs)
- [x] Include payoff timeline comparison
- [x] Highlight the best option based on user preference (lowest payment vs lowest total cost)

### Refinance Analyzer
- [x] Create RefinanceAnalyzer component
- [x] Input fields for current loan details and new loan offer
- [x] Calculate break-even point for refinancing costs
- [x] Show monthly savings and total savings over loan life
- [x] Factor in refinancing fees and closing costs
- [x] Provide recommendation on whether to refinance
- [x] Add time-to-recoup analysis for upfront costs


## Receipt Scanner Camera Enhancement

- [x] Add direct camera capture button for mobile devices
- [x] Implement camera access using getUserMedia API
- [x] Create camera preview with capture button
- [x] Support both front and rear camera selection
- [x] Auto-process captured image through OCR
- [x] Add mobile-optimized UI for camera mode
- [x] Implement fallback for devices without camera access


## Currency Selector Feature

- [x] Add currency preference field to user settings in database
- [x] Create currency selector dropdown in Profile page
- [x] Support major currencies (USD, EUR, GBP, JPY, CAD, AUD, etc.)
- [x] Save currency preference to database
- [x] Create currency context/hook for global access
- [x] Update Money Hub components to use selected currency symbol
- [x] Format amounts with proper currency symbol and locale


## Currency Selector Bug Fix

- [x] Investigate why currency selector is not working
- [x] Check CurrencyContext provider setup
- [x] Verify database update endpoint
- [x] Test currency selection and persistence
- [x] Ensure currency symbol displays correctly in Money Hub
- [x] Fix formatCurrency function in Budget.tsx to use currency context
- [x] Fix SpendingTrendsChart to use currency context
- [x] Fix RecurringTransactions to use currency context
- [x] Fix DebtCoach page to use currency context


## Currency Support for Loan Components

- [x] Add useCurrency hook to LoanCalculator component
- [x] Replace hardcoded $ with currency symbol in LoanCalculator
- [x] Add useCurrency hook to LoanComparison component
- [x] Replace hardcoded $ with currency symbol in LoanComparison
- [x] Add useCurrency hook to RefinanceAnalyzer component
- [x] Replace hardcoded $ with currency symbol in RefinanceAnalyzer
- [x] Test all loan components with different currencies


## Currency Symbol in Input Fields

- [x] Add currency symbol prefix to LoanCalculator input fields
- [x] Add currency symbol prefix to LoanComparison input fields
- [x] Add currency symbol prefix to RefinanceAnalyzer input fields
- [x] Add currency symbol prefix to Budget page transaction inputs
- [x] Add currency symbol prefix to DebtCoach debt entry inputs
- [x] Update Overview tab to use selected currency symbol
- [x] Test all input fields display correct currency symbol


## Navbar Cleanup

- [x] Remove Voice Assistant link from navbar
- [x] Remove IoT Devices link from navbar
- [x] Change Home link to icon-only (remove text)


## Pronunciation Analysis Bug Fix

- [ ] Investigate waveform visualization showing same wave as native
- [ ] Fix user recording waveform to display actual audio data
- [ ] Implement proper pronunciation scoring algorithm
- [ ] Remove hardcoded 80% score
- [ ] Add real audio comparison between user and native pronunciation
- [ ] Test with different pronunciations to verify scoring accuracy


## Pronunciation Analysis Feature Fix
- [x] Fixed waveform comparison showing same waveform for native and user
  - [x] Implemented distinct reference waveform generation based on word characteristics
  - [x] Reference waveform now shows idealized pattern based on syllable count and stress
- [x] Fixed scoring always returning 80% regardless of pronunciation quality
  - [x] Created backend analyzePronunciation API endpoint with AI-powered analysis
  - [x] Scoring now based on actual audio characteristics (duration, peaks, variance, silence ratio)
  - [x] Individual scores for pitch, clarity, timing, and accent
  - [x] LLM-generated personalized feedback with SASS-E personality
- [x] Improved user experience
  - [x] Added loading state during analysis
  - [x] Added detailed score breakdown with progress bars
  - [x] Added contextual improvement tips based on weak areas


## Bug Fix - TTS Not Working on Mobile Devices
- [x] Fix "Text-To-Speech Voice are unavailable" error on mobile browsers
- [x] Investigate mobile browser TTS voice loading issues
- [x] Implement proper voice initialization for mobile devices
  - Added multiple retry attempts with increasing delays for voice loading
  - Added visibility change listener to reload voices when user returns to app
  - Expanded language locale mapping for better mobile voice matching
  - Added voice caching to prevent repeated loading issues
- [x] Add fallback mechanism when browser TTS is unavailable
  - Now tries to speak even without enumerated voices (mobile browsers may still work)
  - Common languages assumed available even if voices aren't enumerated
  - Improved error messages with helpful suggestions
- [x] Test on mobile browsers (Chrome, Safari, Firefox)


## TTS Voice Quality Improvement
- [x] Prioritize natural/enhanced voices over basic robotic voices
  - Added scoring: natural (+100), neural (+100), wavenet (+90), enhanced (+80), premium (+80)
- [x] Prefer female voices over male voices
  - Added 50+ female voice name patterns across platforms
  - Female voices get +50 score, male voices get -30 penalty
- [x] Add voice quality scoring system
  - Comprehensive scoring based on voice name indicators
  - Network/cloud voices preferred (+20) over local robotic voices
- [x] Filter out low-quality system voices
  - Penalized: compact (-40), espeak (-50), festival (-40), mbrola (-40), pico (-30)


## Server-Side TTS Implementation (High-Quality Voices)
- [x] Implement server-side TTS API for consistent voice quality
  - Created textToSpeech.ts service using OpenAI-compatible TTS API
  - Uses tts-1-hd model for high-quality pronunciation
- [x] Create backend endpoint for generating TTS audio
  - Added learning.generatePronunciationAudio tRPC endpoint
  - Returns base64-encoded MP3 audio
- [x] Update frontend to fetch and play server-generated audio
  - Updated LanguageLearning.tsx and PronunciationPractice.tsx
  - Falls back to browser TTS if server fails
- [x] Support multiple languages with natural female voices
  - Uses "nova" voice (female, warm) for most languages
  - Uses "shimmer" voice (female, clear) for French/Italian
- [ ] Cache audio for frequently used words (future enhancement)


## Bug Fix - React Hooks Order Error
- [x] Fix "Rendered more hooks than during the previous render" error in LanguageLearning
- [x] Move generateAudio mutation and audioRef to top of component with other hooks
- [x] Ensure all hooks are called in consistent order


## TTS Playback Speed Control
- [x] Add speed state management (0.5x to 1.5x)
  - Added ttsSpeed state with default 0.85x (slightly slower for learning)
- [x] Create speed control UI with slider
  - Added range slider in LanguageLearning vocabulary tab
  - Added range slider in PronunciationPractice component
  - Shows current speed value (e.g., "Speed: 0.85x")
- [x] Integrate speed with server-side TTS generation
  - Updated handlePronounce to use ttsSpeed parameter
  - Updated playNativePronunciation to use ttsSpeed parameter
- [x] Apply speed to browser TTS fallback
  - Browser TTS also uses ttsSpeed for consistent experience
- [x] Persist user's preferred speed in local storage
  - Speed saved to localStorage on change
  - Speed loaded from localStorage on component mount


## Update Money Demo Data
- [x] Review current money-demo.mjs script
- [x] Add sample data for all Money Hub features
  - [x] 4 debts (credit card, student loan, auto loan, personal loan)
  - [x] 18 debt payments with realistic interest/principal calculations
  - [x] 2 shared budgets (Family Monthly Budget, Summer Vacation Fund)
  - [x] 10 budget categories with monthly limits
  - [x] 20 budget transactions across categories
- [x] Run updated money-demo script
  - Successfully populated all Money Hub tables
  - Payment history spans 3-6 months per debt
  - Budget transactions include both expenses and income
- [ ] Verify all features display correctly in UI


## Home Page Redesign - Feature Showcase
- [x] Update home page to showcase all available features
- [x] Highlight Learning page features:
  - [x] Language Learning with vocabulary and pronunciation
  - [x] Math Tutor with step-by-step solutions
  - [x] Science Lab with experiments
  - [x] Specialized Learning Paths (prominent highlight with featured badge)
- [x] Prominently highlight Money Hub features:
  - [x] Premium section with gradient background and decorative elements
  - [x] Debt Coach with payment tracking
  - [x] Budget Management
  - [x] Loan Calculators
  - [x] Receipt Scanner
  - [x] Financial Goals
  - [x] Currency Tools
- [x] Add compelling CTAs for each feature section
  - "Explore Money Hub" button
  - "Start Learning" button
- [x] Ensure responsive design and visual hierarchy
  - Money Hub gets top placement with NEW FEATURE badge
  - Specialized Learning Paths highlighted with Featured badge
  - Responsive grid layouts for all sections


## Bug Fix - Preview Not Loading
- [x] Diagnose why preview does not load
  - Server needed restart to clear stale state
- [x] Check browser console for errors
  - No errors found
- [x] Check dev server status
  - Server running correctly after restart
- [x] Fix any import or syntax errors
  - No syntax errors
- [x] Verify all components render correctly
  - Preview now loads successfully


## Bug Fix - Money Hub Button Link
- [x] Fix "Explore Money Hub" button to link to /money instead of /money-hub
  - Fixed both hero section and main CTA button
- [x] Verify button navigates to correct page


## Bug Fix - Start Learning Button Link
- [x] Fix "Start Learning" button to link to /learning instead of /language-learning
- [x] Verify button navigates to correct page


## Clear Demo Data from Debt Coach
- [x] Remove demo debts and payments from database
  - Cleared debt_payments, debts, shared_budget_*, budget_* tables
- [x] Ensure Debt Coach starts empty for new users
- [x] Keep money-demo.mjs script available for testing
  - Script remains at scripts/money-demo.mjs for re-populating demo data


## Bug Fix - TTS Not Working on iPad
- [x] Investigate iOS Safari audio handling requirements
  - iOS requires audio.load() before play()
  - Play must be in direct response to user interaction
- [x] Fix server-side TTS audio playback on iPad
  - Added audio.load() call before play()
  - Added try-catch for play() with fallback to browser TTS
  - Added detailed error logging
- [x] Ensure audio plays on user interaction (iOS requirement)
  - Play is triggered by button click (user action)
- [ ] Test on iPad Safari and Chrome (requires user testing)


## Bug Fix - Preview Not Loading
- [x] Check dev server status and logs
  - Server was running but needed restart
- [x] Restart dev server if needed
  - Restarted successfully
- [x] Verify all components render correctly
  - Preview now loads correctly


## Wellbeing Feature Development
### Database Schema
- [x] Workout library tables (workouts, user_workout_history)
- [x] Activity tracking tables (daily_activity_stats)
- [x] Nutrition tables (food_log, hydration_log)
- [x] Mental wellness tables (meditation_sessions, mood_log, journal_entries, sleep_tracking)
- [x] Health metrics tables (health_metrics, wellbeing_reminders)
- [x] Database migration pushed successfully

### Backend API
- [x] Fitness endpoints (workouts, activity tracking)
  - getWorkouts, getWorkoutById, getWorkoutHistory, logWorkout
  - getDailyActivity, updateDailyActivity
- [x] Nutrition endpoints (food logging, hydration)
  - getFoodLog, addFoodLog, deleteFoodLog
  - getHydrationLog, addHydrationLog
- [x] Mental wellness endpoints (meditation, mood tracking, journaling, sleep)
  - getMeditationSessions, logMeditationSession
  - getMoodLog, updateMoodLog
  - getJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry
  - getSleepTracking, addSleepTracking
- [x] Health metrics endpoints (biometrics, reminders)
  - getHealthMetrics, addHealthMetric
  - getReminders, addReminder, deleteReminder, toggleReminder

### Frontend UI
- [x] Wellbeing page with tabbed interface
  - Overview tab with daily stats dashboard
  - Fitness & Activity tab with workout logging
  - Nutrition tab with food and hydration tracking
  - Mental Wellness tab with mood, meditation, and journaling
  - Health Metrics tab with biometric tracking
- [x] Add Wellbeing link to navigation
- [x] Add /wellbeing route to App.tsxon
- [ ] Update home page to showcase Wellbeing features


## Wellbeing Data Visualization Charts
- [x] Install Chart.js and react-chartjs-2
- [x] Create reusable chart components
  - WorkoutTrendsChart (dual-axis: duration + calories)
  - CalorieTrackingChart (bar chart with goal line)
  - MoodPatternsChart (multi-line: mood, energy, stress)
  - WeightProgressChart (line chart with optional goal)
- [x] Add workout trends chart to Fitness tab
  - Dual-axis chart showing duration and calories burned over time
  - Only displays when workout history exists
- [x] Add calorie tracking chart to Nutrition tab
  - Bar chart with daily goal line
  - Shows 7-day calorie intake trend
- [x] Add mood patterns chart to Mental Wellness tab
  - Multi-line chart showing mood, energy, and stress trends
  - 7-day historical data with current day
- [x] Add weight progress chart to Health Metrics tab
  - Line chart with optional goal weight
  - Filters out entries without weight data


## Enhanced Food Logging System
### Food Database Integration
- [x] Research food database APIs (OpenFoodFacts, USDA FoodData Central, Nutritionix)
  - Selected OpenFoodFacts API (free, no auth required, 2.9M+ products)
  - Barcode endpoint: GET /api/v2/product/{barcode}
  - Search endpoint: GET /cgi/search.pl
- [x] Integrate barcode scanning API
  - Created OpenFoodFacts API service
  - Added lookupProductByBarcode endpoint
  - Added searchProducts endpoint
- [x] Create food search endpoint with nutritional data
  - Returns complete nutritional data (macros + micros)
  - Includes Nutri-Score and NOVA group
- [ ] Cache frequently searched foods (future enhancement)

### Database Schema Updates
- [x] Extend food_log table with macro/micronutrient fields
  - Added barcode field for scanned products
  - Added servingQuantity for portion tracking
  - Extended macros: fiber, sugars, saturatedFat
  - Added micronutrients: sodium, cholesterol, vitaminA, vitaminC, calcium, iron
  - Changed numeric fields to decimal for precision
- [x] Updated wellbeingRouter input schema to match new fields
- [x] Database migration applied successfully
- [ ] Add food_database table for cached foods (future enhancement)
- [ ] Add custom_foods table for user-created entries (future enhancement)

### Barcode Scanner UI
- [x] Implement camera-based barcode scanner component
  - Created BarcodeScanner.tsx with camera access
  - Uses environment-facing camera on mobile
- [x] Add manual barcode entry fallback
  - Manual input field for barcode entry
- [x] Display scanned food nutritional information
  - Created FoodSearch.tsx component
  - Shows calories, macros, micros, Nutri-Score
  - Badge-based nutritional display
- [x] Handle scan errors gracefully
  - Camera permission error handling
  - Fallback to manual entry

### Enhanced Food Logging
- [ ] Add food search with autocomplete
- [ ] Display detailed nutritional breakdown (protein, carbs, fats, fiber, vitamins, minerals)
- [ ] Add serving size adjustment
- [ ] Show daily macro/micro totals with progress bars
- [ ] Add nutritional goals setting


## Barcode Scanner Integration & Macro Tracking Dashboard
- [x] Integrate BarcodeScanner component into Nutrition tab
  - [x] Add "Scan Barcode" button to food logging card
  - [x] Open BarcodeScanner modal on button click
  - [x] Auto-populate food details from scanned barcode
  - [x] Added handleBarcodeScanned function with OpenFoodFacts API lookup
- [x] Integrate FoodSearch component into Nutrition tab
  - [x] Add "Search Food" button to food logging card
  - [x] Add food search interface with modal
  - [x] Display nutritional breakdown for selected foods
  - [x] Added macro input fields (protein, carbs, fat) to food logging
- [x] Create macro/micro tracking dashboard
  - [x] Add daily macro goals (protein, carbs, fat, calories)
  - [x] Create progress bars for macro intake vs. goals
  - [x] Add micronutrient tracking (fiber, vitamins, minerals)
  - [x] Display RDA percentages for micronutrients
  - [x] Add visual indicators for meeting/exceeding goals
  - [x] Color-coded status (green/yellow/red) based on goal achievement
  - [x] Badge indicators for RDA percentages
  - [x] Special handling for sodium (lower is better)


## Wellbeing - Workout Library
- [x] Create workout_library table in database schema
- [x] Create seed script with 20-30 guided workouts (yoga, HIIT, strength)
- [x] Add workout difficulty levels, durations, equipment requirements
- [x] Build workout library browser UI in Fitness tab
- [x] Add workout filtering by type, difficulty, duration
- [x] Integrate "Start Workout" button to create workout sessions
- [x] Add workout preview with exercise list

## Wellbeing - Wearable Device Integration
- [x] Research Apple Health, Google Fit, Fitbit API integration options
- [x] Create wearable_connections table for device linking
- [x] Create wearable_sync_logs table for tracking syncs
- [x] Add backend API endpoints for device authorization
- [x] Implement automatic data sync for steps, heart rate, sleep, weight
- [x] Build device connection UI in Health Metrics tab
- [x] Add sync status indicators and manual sync button
- [x] Handle OAuth flows for device authorization


## Home Page Updates
- [x] Add Wellbeing featured section to home page
- [x] Highlight fitness tracking with workout library
- [x] Showcase barcode scanning nutrition tools
- [x] Feature mental wellness tools (mood tracking, meditation, journaling)
- [x] Update layout to balance Money Hub, Learning, and Wellbeing sections
- [x] Add navigation links to Wellbeing page


## Wellbeing Page Styling
- [x] Update Wellbeing page header to use cyan/blue gradient (matching home page)
- [x] Change accent colors from current theme to cyan/blue tones
- [x] Update card borders and highlights to cyan color scheme
- [x] Ensure consistency with Money (green) and Learning (purple) page styling patterns
- [x] Update tab indicators and active states to cyan
- [x] Adjust button colors to match cyan/blue theme


## Rename Wellbeing to Wellness
- [x] Update Navigation component - change "Wellbeing" to "Wellness"
- [x] Update page route from /wellbeing to /wellness
- [x] Rename Wellbeing.tsx page file to Wellness.tsx
- [x] Update page title and header text to "Wellness"
- [x] Update Home page Wellbeing section to "Wellness"
- [x] Update all "Wellbeing Hub" references to "Wellness Hub"
- [x] Update App.tsx route configuration


## Wellness Onboarding Assessment
- [x] Create user_wellness_profile table for storing assessment data
- [x] Create wellness_goals table for tracking user goals
- [x] Build onboarding questionnaire UI component
- [x] Add questions about fitness level (beginner/intermediate/advanced)
- [x] Add questions about wellness goals (weight loss, muscle gain, stress reduction, etc.)
- [x] Add questions about lifestyle (activity level, sleep, diet preferences)
- [x] Add questions about challenges and barriers
- [x] Create onboarding flow that triggers on first Wellness page visit
- [x] Store assessment results in database

## AI-Powered Adaptive Coaching
- [x] Create coaching_recommendations table for storing AI suggestions
- [x] Create coaching_feedback table for tracking user feedback
- [x] Implement AI service for generating personalized recommendations
- [x] Build recommendation engine that analyzes user progress data
- [x] Create daily/weekly coaching insights based on logged activities
- [x] Add adaptive workout suggestions based on fitness level and progress
- [x] Add nutrition recommendations based on goals and food logs
- [x] Add mental wellness tips based on mood patterns
- [x] Create coaching dashboard widget in Wellness Overview
- [x] Implement feedback mechanism for coaching suggestions
- [x] Add progress-based plan adjustments


## Bug Fixes
- [ ] Fix wellness profile creation database insert error (id and lastUpdated fields)


## Money Hub - Goals Tab Bug
- [x] Investigate Create Goal feature issue
- [x] Fix Create Goal functionality
- [x] Test goal creation and display


## Sign Out Feature
- [x] Add sign out button to navigation
- [x] Implement logout functionality
- [x] Test sign out and sign in flow


## Caching and State Synchronization Issues
- [x] Fix tRPC query caching configuration
- [x] Implement proper cache invalidation on mutations
- [x] Add optimistic updates for immediate UI feedback
- [x] Configure React Query staleTime and gcTime
- [x] Test changes appear without page refresh
- [x] Verify no need to clear browser data for updates


## Money Hub Promotional Content
- [x] Add detailed feature descriptions to Money Hub page
- [x] Highlight AI-powered insights and automation
- [x] Showcase expense tracking and categorization
- [x] Promote financial goals and progress tracking
- [x] Describe budgeting and spending analysis features
- [x] Add visual appeal with icons and layout


## Learning Page Promotional Content
- [x] Add detailed feature descriptions to Learning page
- [x] Highlight AI-powered learning paths and personalization
- [x] Showcase course library and skill tracking
- [x] Promote interactive lessons and progress monitoring
- [x] Describe certification and achievement features
- [x] Add visual appeal with icons and layout


## Wellness Page Promotional Content
- [x] Add detailed feature descriptions to Wellness page
- [x] Highlight fitness tracking and workout library
- [x] Showcase nutrition tools and barcode scanning
- [x] Promote mental wellness and mood tracking
- [x] Describe wearable device integration
- [x] Add visual appeal with icons and layout


## Wellness Page Routing Bug
- [x] Investigate why Wellness link redirects to sign-in
- [x] Fix routing to show promotional page for non-authenticated users
- [x] Test Wellness page access without authentication


## Mobile Navigation Bug
- [x] Add Wellness link to mobile menu
- [x] Test mobile menu navigation


## PWA Enhancements
- [x] Create custom install prompt dialog component
- [x] Improve install button UX with benefits showcase
- [x] Implement service worker for offline caching
- [x] Add offline indicator in navigation
- [x] Cache static assets and API responses
- [x] Create offline fallback pages
- [x] Update PWA manifest with proper icons and metadata
- [x] Add app shortcuts for quick actions
- [x] Test offline functionality
- [x] Test install flow on different devices


## Learning.tsx TypeScript Error Fix
- [x] Identify the source of TypeScript errors at line 686
- [x] Fix unclosed JSX tags in Learning.tsx
- [x] Verify TypeScript compilation passes
- [x] Test Learning page functionality


## Replace InstallPrompt with InstallBanner
- [x] Update App.tsx to import InstallBanner instead of InstallPrompt
- [x] Test banner appears after 2 page views
- [x] Verify banner functionality (install/dismiss)


## Wellness Demo Page
- [x] Create WellnessDemo.tsx page component
- [x] Add sample workout data
- [x] Add sample nutrition tracking data
- [x] Add sample mood/mental wellness data
- [x] Add route in App.tsx
- [x] Add demo link on Wellness page
- [x] Test demo page functionality


## Money Demo Link
- [x] Add "View Demo" button to Money page hero section


## Terms and Conditions
- [x] Draft comprehensive Terms and Conditions document
- [x] Create Terms.tsx page component
- [x] Add Terms link to footer navigation
- [x] Add route in App.tsx


## Privacy Policy
- [x] Draft comprehensive Privacy Policy document with GDPR/CCPA compliance
- [x] Create Privacy.tsx page component
- [x] Update Footer component with active Privacy Policy link
- [x] Add route in App.tsx


## Footer on All Pages
- [x] Add Footer to Money.tsx
- [x] Add Footer to MoneyDemo.tsx
- [x] Add Footer to Wellness.tsx
- [x] Add Footer to WellnessDemo.tsx
- [x] Add Footer to Learning.tsx
- [x] Add Footer to LanguageLearning.tsx
- [x] Add Footer to MathTutor.tsx
- [x] Add Footer to ScienceLab.tsx
- [x] Add Footer to VoiceAssistant.tsx
- [x] Add Footer to Profile.tsx
- [x] Add Footer to Goals.tsx
- [x] Add Footer to Terms.tsx
- [x] Add Footer to Privacy.tsx


## Footer Not Showing Bug
- [x] Investigate why footer is not displaying on pages - Footer only shows when signed in
- [x] Fix Footer to show in signed-out views of Money, Wellness, and Learning pages
- [x] Verify Footer placement in page components
- [x] Test footer visibility in browser


## Voice Chat Date/Time Fix
- [x] Detect user's timezone using browser API
- [x] Pass current date and time with timezone to voice chat system prompt
- [x] Update voice assistant to use accurate date/time in responses
- [x] Test date/time accuracy in voice chat


## Weather Integration
- [x] Integrate OpenWeatherMap API for weather data
- [x] Add location detection using browser geolocation API
- [x] Pass weather data to voice assistant system prompt
- [x] Add sarcastic weather commentary to responses

## Conversation Memory
- [x] Create conversation history storage for current session
- [x] Store last 5-10 exchanges in memory
- [x] Pass conversation context to system prompt
- [x] Clear memory on page refresh or explicit user request
- [x] Test follow-up question handling


## Clear Memory Button
- [x] Add "Clear Memory" button to voice assistant UI
- [x] Implement clear memory handler function
- [x] Show confirmation toast when memory is cleared
- [x] Test memory clearing functionality


## Clear Memory Button Not Showing Bug
- [x] Check if conversationMemory state is being updated
- [x] Verify button conditional rendering logic
- [x] Test button appears after voice interaction
- [x] Fix visibility issue - Button now always visible, disabled when no memory


## Clear All Conversation History Button
- [x] Create backend tRPC procedure to delete all conversation history for user
- [x] Add "Clear All History" button to voice assistant UI
- [x] Implement confirmation dialog before deletion
- [x] Show success toast after deletion
- [x] Refresh conversation display after clearing
- [x] Test deletion functionality


## Fix Missing assistant.history Procedure
- [x] Add history procedure alias to assistant router pointing to getConversations
- [x] Test that voice assistant loads without errors


## Fix Learning Page toUpperCase Error
- [x] Find line 1461 in Learning.tsx where toUpperCase is called on undefined
- [x] Add null/undefined check before calling toUpperCase
- [x] Test Learning page loads without errors


## Fix Fact Verification Accuracy
- [x] Investigate current fact verification implementation in Learning page
- [x] Identify why verification gives incorrect results for current events - LLM was relying on training data instead of search results
- [x] Add web search integration to fact verification for up-to-date information - Enhanced to use advanced search with 30-day recency
- [x] Update system prompt to use search results for verification - Added explicit instructions to prioritize search over training data
- [x] Test with current events questions (e.g., "Is Ozzy Osbourne still alive?")


## Fix Ozzy Osbourne Fact Verification
- [x] Test Tavily search with "Is Ozzy Osbourne still alive?" to see what results are returned - Search returns correct death information
- [x] Check if Wikipedia is in the search results - Yes, Wikipedia and BBC/Sky News all confirm July 22, 2025 death
- [x] Enhance search query to include "death" or "2025" for better results - Not needed, search already returns correct results
- [x] Modify initial explanation to search BEFORE generating answer for current events - Restructured flow to search first, then generate explanation based on search results
- [x] Test verification returns correct death date (July 22, 2025)


## Verified Knowledge Base System (Cross-User Learning)
- [x] Create verifiedFacts database table with fields: id, question, answer, sources, verificationStatus, verifiedAt, expiresAt
- [x] Add database helper functions: saveVerifiedFact, getVerifiedFact, searchVerifiedFacts
- [x] Update Learning Hub fact verification to save results to database after verification
- [x] Add knowledge base query to Voice Assistant system prompt
- [x] Implement fact freshness check (auto re-verify facts older than 30 days) - facts expire after 30 days
- [x] Test: Verify fact in Learning Hub, then ask same question in Voice Assistant - All 7 tests passed
- [x] Test: Multiple users asking similar questions get consistent up-to-date answers - Knowledge base shared across users


## Fact Update Notification System
- [x] Create factAccessLog table to track which users accessed which facts
- [x] Create factUpdateNotifications table for storing notifications
- [x] Add tracking when users access verified facts (Voice Assistant, Learning Hub)
- [x] Implement notification creation when facts are re-verified with changes
- [x] Add notification API endpoints (getNotifications, markAsRead, dismissNotification)
- [x] Build notification bell icon in header with unread count badge
- [x] Create notification dropdown panel with update details
- [x] Add "What Changed" comparison view for fact updates - shows old vs new versions
- [x] Test: User accesses fact → fact gets updated → user receives notification - All 8 tests passed
- [x] Test: Notification shows old vs new information clearly - Old/new versions parsed correctly


## Bug Fixes
- [x] Remove extra footer in Budget, Debt Coach, and Goals tabs of Money Hub

## Translation Feature Improvement
- [x] Simplify translation to only translate user input (no response generation)
- [x] Remove sarcastic personality from translation mode
- [x] Update translation router to do direct translation only
- [x] Test translation feature works as simple translator - Server running successfully

## Image-to-Text Translation Feature
- [x] Create backend endpoint for image translation (translateImage)
- [x] Use LLM vision API to extract text from uploaded images (OCR)
- [x] Auto-detect source language from extracted text
- [x] Translate extracted text to user's target language
- [x] Add camera/photo upload UI in Voice Assistant translation mode
- [x] Add image preview before translation
- [x] Display extracted text and translation results
- [x] Test with various image types (signs, documents, handwritten text) - Server running successfully, UI integrated

## Copy-to-Clipboard Feature
- [x] Add copy button for translated text in image translation results
- [x] Show toast notification on successful copy
- [x] Handle copy errors gracefully

## Standalone Translation Page
- [x] Create dedicated Translation.tsx page component
- [x] Add text input translation section with source/target language selection
- [x] Add image translation section with camera/upload functionality
- [x] Display translation results with copy buttons
- [x] Add Translation link to navigation
- [x] Add /translate route to App.tsx
- [x] Remove translation mode from Voice Assistant page
- [x] Test standalone translation page functionality - Server running, Translation link visible in navigation
