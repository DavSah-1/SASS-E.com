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
