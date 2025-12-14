import { invokeLLM } from "../server/_core/llm";

async function testLLM() {
  console.log("Testing invokeLLM function...\n");

  try {
    // Test 1: Simple text generation
    console.log("Test 1: Simple text generation");
    const response1 = await invokeLLM({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello in one sentence." },
      ],
    });
    console.log("✅ Test 1 passed");
    console.log("Response:", response1.choices[0].message.content);
    console.log("");

    // Test 2: JSON schema generation (like quiz questions)
    console.log("Test 2: JSON schema generation");
    const response2 = await invokeLLM({
      messages: [
        { role: "system", content: "You are a quiz generator." },
        { role: "user", content: "Generate a simple quiz question about water." },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "quiz_question",
          strict: true,
          schema: {
            type: "object",
            properties: {
              question: { type: "string" },
              answer: { type: "string" },
            },
            required: ["question", "answer"],
            additionalProperties: false,
          },
        },
      },
    });
    console.log("✅ Test 2 passed");
    console.log("Response:", response2.choices[0].message.content);
    console.log("");

    console.log("All tests passed! ✅");
  } catch (error) {
    console.error("❌ Test failed:");
    console.error(error);
    process.exit(1);
  }
}

testLLM();
