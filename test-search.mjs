// Test script to check what Tavily returns for Ozzy Osbourne query
import 'dotenv/config';

const query = "Is Ozzy Osbourne still alive?";

const response = await fetch("https://api.tavily.com/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    api_key: process.env.TAVILY_API_KEY,
    query: query,
    max_results: 5,
    search_depth: "advanced",
    include_answer: true,
    include_raw_content: false,
    days: 30,
  }),
});

const data = await response.json();

console.log("Query:", query);
console.log("\nAnswer:", data.answer);
console.log("\nTop 5 Results:");
data.results?.forEach((result, i) => {
  console.log(`\n[${i + 1}] ${result.title}`);
  console.log(`URL: ${result.url}`);
  console.log(`Content: ${result.content?.substring(0, 200)}...`);
});
