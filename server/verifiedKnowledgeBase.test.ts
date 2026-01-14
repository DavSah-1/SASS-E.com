import { describe, it, expect, beforeAll } from 'vitest';
import { 
  saveVerifiedFact, 
  getVerifiedFact, 
  searchVerifiedFacts,
  normalizeQuestion 
} from './db';

describe('Verified Knowledge Base System', () => {
  const testQuestion = "Is Ozzy Osbourne still alive?";
  const testAnswer = "According to recent sources from July 2025, Ozzy Osbourne passed away on July 22, 2025. Multiple reputable sources including Wikipedia, BBC, and Sky News have confirmed this information.";
  const testSources = JSON.stringify([
    { title: "Ozzy Osbourne - Wikipedia", url: "https://en.wikipedia.org/wiki/Ozzy_Osbourne", credibilityScore: 90 },
    { title: "Ozzy Osbourne dies aged 76 - BBC News", url: "https://www.bbc.com/news", credibilityScore: 95 },
    { title: "Rock legend Ozzy Osbourne dead at 76 - Sky News", url: "https://news.sky.com", credibilityScore: 90 }
  ]);

  it('should normalize questions correctly', () => {
    const normalized1 = normalizeQuestion("Is Ozzy Osbourne still alive?");
    const normalized2 = normalizeQuestion("is ozzy osbourne still alive");
    const normalized3 = normalizeQuestion("  Is   Ozzy   Osbourne   still   alive???  ");
    
    // All variations should normalize to the same string
    expect(normalized1).toBe(normalized2);
    expect(normalized2).toBe(normalized3);
    expect(normalized1).toBe("is ozzy osbourne still alive");
  });

  it('should save a verified fact to the database', async () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    const result = await saveVerifiedFact({
      question: testQuestion,
      normalizedQuestion: normalizeQuestion(testQuestion),
      answer: testAnswer,
      verificationStatus: 'verified',
      confidenceScore: 95,
      sources: testSources,
      verifiedAt: new Date(),
      expiresAt,
      verifiedByUserId: 1, // Test user
    });

    expect(result).toBeDefined();
    expect(result[0].insertId).toBeGreaterThan(0);
  });

  it('should retrieve a verified fact by normalized question', async () => {
    const normalizedQ = normalizeQuestion(testQuestion);
    const fact = await getVerifiedFact(normalizedQ);

    expect(fact).toBeDefined();
    expect(fact?.question).toBe(testQuestion);
    expect(fact?.answer).toContain("Ozzy Osbourne");
    expect(fact?.verificationStatus).toBe('verified');
    expect(fact?.confidenceScore).toBe(95);
    
    // Check that sources are valid JSON
    const sources = JSON.parse(fact!.sources);
    expect(Array.isArray(sources)).toBe(true);
    expect(sources.length).toBeGreaterThan(0);
    expect(sources[0]).toHaveProperty('title');
    expect(sources[0]).toHaveProperty('url');
  });

  it('should match questions with different wording', async () => {
    // These should all match the same normalized question
    const variations = [
      "Is Ozzy Osbourne still alive?",
      "is ozzy osbourne still alive",
      "IS OZZY OSBOURNE STILL ALIVE???",
      "  is   ozzy   osbourne   still   alive  "
    ];

    for (const variation of variations) {
      const normalizedQ = normalizeQuestion(variation);
      const fact = await getVerifiedFact(normalizedQ);
      expect(fact).toBeDefined();
      expect(fact?.answer).toContain("Ozzy Osbourne");
    }
  });

  it('should search for verified facts by keyword', async () => {
    const results = await searchVerifiedFacts("Ozzy", 5);
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].question).toContain("Ozzy");
  });

  it('should NOT return expired facts', async () => {
    // Save a fact that expired yesterday
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);

    await saveVerifiedFact({
      question: "Is Elvis Presley still alive?",
      normalizedQuestion: normalizeQuestion("Is Elvis Presley still alive?"),
      answer: "No, Elvis Presley died in 1977.",
      verificationStatus: 'verified',
      confidenceScore: 100,
      sources: JSON.stringify([{ title: "Wikipedia", url: "https://wikipedia.org", credibilityScore: 95 }]),
      verifiedAt: new Date('2024-01-01'),
      expiresAt: expiredDate, // Already expired
      verifiedByUserId: 1,
    });

    // Try to retrieve the expired fact
    const fact = await getVerifiedFact(normalizeQuestion("Is Elvis Presley still alive?"));
    
    // Should not return expired facts
    expect(fact).toBeUndefined();
  });

  it('should update access count when fact is retrieved', async () => {
    const normalizedQ = normalizeQuestion(testQuestion);
    
    // Get the fact (this should increment access count)
    const fact1 = await getVerifiedFact(normalizedQ);
    const accessCount1 = fact1?.accessCount || 0;
    
    // Get it again
    const fact2 = await getVerifiedFact(normalizedQ);
    const accessCount2 = fact2?.accessCount || 0;
    
    // Access count should have increased
    expect(accessCount2).toBeGreaterThan(accessCount1);
  });
});
