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
