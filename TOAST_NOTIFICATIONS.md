# Toast Notifications Implementation

## Overview
This document describes the implementation of Sonner toast notifications for displaying Bob's sarcastic error messages from backend API errors.

## Implementation Details

### 1. Global Error Handler (`client/src/main.tsx`)
- Added `toast` import from `sonner` library
- Implemented error handlers for both query and mutation caches
- Toast notifications display automatically when tRPC errors occur
- Configuration:
  - Duration: 5 seconds
  - Position: top-right
  - Error message: Extracted from `TRPCClientError.message`

### 2. Error Flow
```
Backend Error → handleError() → TRPCError → 
Frontend tRPC Client → QueryClient Cache → 
Toast Notification (Sonner)
```

### 3. Toast Component (`client/src/App.tsx`)
- `<Toaster />` component from `@/components/ui/sonner` is rendered at app root
- Positioned within `ThemeProvider` and `TooltipProvider` for proper styling
- Automatically handles toast lifecycle (show, auto-dismiss, animations)

## Error Testing Page

### Location
`/error-test` - A dedicated page for testing error handling

### Features
- **Database Error Test**: Triggers database-related errors
- **Validation Error Test**: Tests input validation errors
- **API Error Test**: Simulates external API failures
- **Auth Error Test**: Tests authentication errors (2FA)
- **Translation Error Test**: Tests translation service errors

### Usage
1. Navigate to `/error-test`
2. Click any error button to trigger that error type
3. Observe:
   - Toast notification in top-right corner
   - Bob's sarcastic error message
   - Auto-dismiss after 5 seconds
   - Console log of the error

## Backend Error Messages

All backend procedures wrapped with `handleError()` function that:
1. Catches errors from try-catch blocks
2. Generates sarcastic error messages based on error type
3. Converts to TRPC errors with appropriate codes
4. Logs errors to server console with context

### Error Types Handled
- `DatabaseError`: Database operation failures
- `ValidationError`: Input validation failures
- `APIError`: External API failures (Tavily, OpenAI, etc.)
- `TranscriptionError`: Voice transcription failures
- `SearchError`: Web search failures
- `TranslationError`: Translation service failures
- `IoTError`: IoT device control failures
- `LearningError`: Learning feature failures
- `AuthError`: Authentication failures
- `QuotaExceededError`: Rate limit/quota exceeded

## Testing in Real Browsers

**Note**: Toast notifications may not be visible in headless browser environments or preview modes, but they work correctly in real browsers.

To test in a real browser:
1. Open the deployed site in Chrome, Firefox, or Safari
2. Navigate to `/error-test`
3. Click any error button
4. You should see a toast notification appear in the top-right corner with Bob's sarcastic message

## Example Error Messages

- **Database Error**: "Oh fantastic, the database decided to take a vacation. How delightful."
- **Validation Error**: "Wow, you really thought that input would work? Impressive optimism."
- **API Error**: "The external service is having a moment. Shocking, I know."
- **Auth Error**: "Invalid verification code. Did you even try?"
- **Translation Error**: "Translation failed. Maybe stick to one language?"

## Console Logging

All errors are logged to both:
1. **Browser Console**: For frontend debugging
2. **Server Console**: With context like `[Auth Enable 2FA] Error: Invalid verification code`

## Future Enhancements

- [ ] Add success toast notifications for completed actions
- [ ] Implement info/warning toasts for non-error notifications
- [ ] Add custom toast styling to match Bob's personality
- [ ] Create toast notification history/log viewer
- [ ] Add toast notification preferences (position, duration, sound)
