#!/bin/bash
echo "=== SASS-E.com Implementation Review ==="
echo ""
score=0
total=10

# Check 1: Error Handling
echo "1️⃣  ERROR HANDLING & FALLBACKS"
if [ -f "server/errors.ts" ]; then
  echo "  ✅ server/errors.ts exists"
  ((score++))
  grep -q "AppError\|SearchError\|TranscriptionError" server/errors.ts && echo "    ✓ Custom error classes found" || echo "    ⚠️  Check error class implementations"
else
  echo "  ❌ server/errors.ts NOT FOUND"
fi

if grep -rq "try {" server/_core/*.ts 2>/dev/null; then
  echo "    ✓ Try-catch blocks found in core files"
else
  echo "    ⚠️  No try-catch blocks found"
fi
echo ""

# Check 2: Rate Limiting
echo "2️⃣  RATE LIMITING"
if grep -q "express-rate-limit" package.json; then
  echo "  ✅ express-rate-limit installed"
  ((score++))
else
  echo "  ❌ express-rate-limit NOT installed"
fi

if [ -f "server/middleware/rateLimiter.ts" ]; then
  echo "    ✓ Rate limiter middleware exists"
else
  echo "    ⚠️  server/middleware/rateLimiter.ts NOT FOUND"
fi
echo ""

# Check 3: Database Indexes
echo "3️⃣  DATABASE INDEXES"
if grep -q "index(" drizzle/schema.ts; then
  echo "  ✅ Indexes defined in schema"
  ((score++))
  grep "index(" drizzle/schema.ts | head -3
else
  echo "  ❌ No indexes found in schema"
fi
echo ""

# Check 4: Testing Framework
echo "4️⃣  TESTING FRAMEWORK"
if grep -q "vitest" package.json && grep -q "@testing-library" package.json; then
  echo "  ✅ Testing dependencies installed"
  ((score++))
else
  echo "  ❌ Testing dependencies NOT installed"
fi

if [ -d "tests/unit" ] && [ -d "tests/integration" ]; then
  echo "    ✓ Test directories exist"
  echo "    Tests found: $(find tests -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l)"
else
  echo "    ⚠️  Test directories NOT organized"
fi
echo ""

# Check 5: Audio Cleanup
echo "5️⃣  AUDIO CLEANUP"
if grep -q "node-cron" package.json; then
  echo "  ✅ node-cron installed"
  ((score++))
else
  echo "  ❌ node-cron NOT installed"
fi

if [ -f "server/services/audioCleanup.ts" ]; then
  echo "    ✓ Audio cleanup service exists"
else
  echo "    ⚠️  server/services/audioCleanup.ts NOT FOUND"
fi
echo ""

# Check 6: Pagination
echo "6️⃣  PAGINATION"
if grep -q "getConversationsPaginated" server/db.ts 2>/dev/null; then
  echo "  ✅ Pagination implemented"
  ((score++))
else
  echo "  ❌ Pagination NOT implemented"
fi
echo ""

# Check 7: Cloud Storage
echo "7️⃣  CLOUD STORAGE (S3/R2)"
if grep -q "@aws-sdk/client-s3" package.json; then
  echo "  ✅ AWS SDK installed"
  ((score++))
else
  echo "  ❌ AWS SDK NOT installed"
fi

if [ -f "server/services/storage.ts" ]; then
  echo "    ✓ Storage service exists"
else
  echo "    ⚠️  server/services/storage.ts NOT FOUND"
fi
echo ""

# Check 8: Caching
echo "8️⃣  CACHING"
if [ -f "server/services/cache.ts" ]; then
  echo "  ✅ Cache service exists"
  ((score++))
  grep -q "ioredis" package.json && echo "    ✓ Redis client installed" || echo "    ⚠️  Using in-memory cache only"
else
  echo "  ❌ server/services/cache.ts NOT FOUND"
fi
echo ""

# Check 9: Logging & Monitoring
echo "9️⃣  LOGGING & MONITORING"
if grep -q "winston" package.json; then
  echo "  ✅ Winston installed"
  ((score++))
else
  echo "  ❌ Winston NOT installed"
fi

if [ -f "server/utils/logger.ts" ] && [ -f "server/utils/metrics.ts" ]; then
  echo "    ✓ Logger and metrics utilities exist"
elif [ -f "server/utils/logger.ts" ]; then
  echo "    ⚠️  Logger exists but no metrics"
else
  echo "    ⚠️  Logging utilities NOT FOUND"
fi

if [ -d "logs" ]; then
  echo "    ✓ Logs directory exists ($(ls logs/*.log 2>/dev/null | wc -l) log files)"
fi
echo ""

# Check 10: Directory Organization
echo "🔟 DIRECTORY ORGANIZATION"
if [ -d "docs" ] && [ -d "tests" ] && [ -d "data" ]; then
  echo "  ✅ Directories organized"
  ((score++))
  echo "    ✓ docs/ tests/ data/ exist"
else
  echo "  ❌ Directories NOT organized"
  [ ! -d "docs" ] && echo "    Missing: docs/"
  [ ! -d "tests" ] && echo "    Missing: tests/"  
  [ ! -d "data" ] && echo "    Missing: data/"
fi

# Count files in root
root_files=$(ls -1 *.mjs *.json *.md 2>/dev/null | grep -v "package\|README\|tsconfig\|pnpm-lock\|components" | wc -l)
echo "    Files in root directory: $root_files (should be ~5-10)"
echo ""

# Summary
echo "═══════════════════════════════════════"
echo "FINAL SCORE: $score/10"
echo "═══════════════════════════════════════"

if [ $score -ge 9 ]; then
  echo "🎉 EXCELLENT! Nearly complete implementation"
elif [ $score -ge 7 ]; then
  echo "👍 GOOD! Solid progress, few items remaining"
elif [ $score -ge 5 ]; then
  echo "⚠️  FAIR - About halfway there"
else
  echo "❌ NEEDS WORK - Most items not implemented"
fi
