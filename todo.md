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
- [ ] Integrate multi-language TTS support
- [x] Add language swap button
- [ ] Update speech recognition to support multiple languages
- [x] Preserve Bob's personality in translations
- [x] Add translation mode toggle

