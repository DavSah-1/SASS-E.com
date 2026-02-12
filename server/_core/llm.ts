import { ENV } from "./env";
import { APIError, logError } from "../errors";
import { getLLMFallbackResponse } from "./errorMessages";

/**
 * LLM Integration with comprehensive error handling
 * 
 * Features:
 * - Automatic timeout protection (60 seconds)
 * - Retry logic for transient failures
 * - Fallback responses when LLM fails
 * - Comprehensive error handling
 * - Request/response logging
 */

/**
 * Configuration constants
 */
const LLM_TIMEOUT_MS = 60000; // 60 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000; // 1 second base delay

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const resolveApiUrl = () =>
  ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";

const assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new APIError("LLM API key is not configured", "manus");
  }
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

/**
 * Invoke LLM with comprehensive error handling and retry logic
 * 
 * @param params - LLM invocation parameters
 * @param retryCount - Current retry attempt (used internally)
 * @returns LLM response
 * @throws {APIError} When LLM fails after all retries
 */
export async function invokeLLM(
  params: InvokeParams,
  retryCount: number = 0
): Promise<InvokeResult> {
  try {
    assertApiKey();

    const {
      messages,
      tools,
      toolChoice,
      tool_choice,
      outputSchema,
      output_schema,
      responseFormat,
      response_format,
    } = params;

    // Validate messages
    if (!messages || messages.length === 0) {
      throw new APIError("Messages array cannot be empty", "manus");
    }

    const payload: Record<string, unknown> = {
      model: "gemini-2.5-flash",
      messages: messages.map(normalizeMessage),
    };

    if (tools && tools.length > 0) {
      payload.tools = tools;
    }

    const normalizedToolChoice = normalizeToolChoice(
      toolChoice || tool_choice,
      tools
    );
    if (normalizedToolChoice) {
      payload.tool_choice = normalizedToolChoice;
    }

    payload.max_tokens = 32768;

    const normalizedResponseFormat = normalizeResponseFormat({
      responseFormat,
      response_format,
      outputSchema,
      output_schema,
    });

    if (normalizedResponseFormat) {
      payload.response_format = normalizedResponseFormat;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

    try {
      const response = await fetch(resolveApiUrl(), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${ENV.forgeApiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting with retry
      if (response.status === 429) {
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
          const jitter = Math.random() * 500;
          
          console.warn(
            `LLM rate limited, retrying in ${delay + jitter}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`
          );
          
          await sleep(delay + jitter);
          return invokeLLM(params, retryCount + 1);
        }
        
        throw new APIError("LLM API rate limit exceeded", "manus");
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        
        // Retry on 5xx errors (server errors)
        if (response.status >= 500 && response.status < 600 && retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
          const jitter = Math.random() * 500;
          
          console.warn(
            `LLM server error ${response.status}, retrying in ${delay + jitter}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`
          );
          
          await sleep(delay + jitter);
          return invokeLLM(params, retryCount + 1);
        }
        
        console.error("[invokeLLM] Request failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        
        throw new APIError(
          `LLM invoke failed: ${response.status} ${response.statusText}`,
          "manus"
        );
      }

      const result = (await response.json()) as InvokeResult;
      
      // Validate response structure
      if (!result || !result.choices || result.choices.length === 0) {
        throw new APIError("LLM returned empty response", "manus");
      }
      
      if (!result.choices[0].message || !result.choices[0].message.content) {
        throw new APIError("LLM returned invalid response structure", "manus");
      }
      
      console.log("[invokeLLM] Success:", {
        model: result.model,
        choicesCount: result.choices?.length || 0,
        hasContent: !!result.choices?.[0]?.message?.content
      });
      
      return result;
      
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      logError(error, 'invokeLLM');
      throw new APIError('LLM request timed out', 'manus');
    }
    
    // Re-throw APIError
    if (error instanceof APIError) {
      logError(error, 'invokeLLM');
      throw error;
    }

    // Handle unexpected errors
    logError(error, 'invokeLLM');
    throw new APIError(
      `LLM invocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'manus'
    );
  }
}

/**
 * Invoke LLM with automatic fallback to sarcastic error message
 * Use this for user-facing features where a response is always expected
 * 
 * @param params - LLM invocation parameters
 * @returns LLM response or fallback message
 */
export async function invokeLLMWithFallback(
  params: InvokeParams
): Promise<string> {
  try {
    const result = await invokeLLM(params);
    
    const content = result.choices[0].message.content;
    
    // Extract text from content
    if (typeof content === 'string') {
      return content;
    }
    
    if (Array.isArray(content)) {
      const textParts = content
        .filter(part => part.type === 'text')
        .map(part => (part as TextContent).text);
      
      return textParts.join('\n');
    }
    
    throw new APIError('Unexpected content format from LLM', 'manus');
    
  } catch (error) {
    // Log the error
    logError(error, 'invokeLLMWithFallback');
    
    // Return a sarcastic fallback response
    return getLLMFallbackResponse();
  }
}

/**
 * Sleep helper for retry delays
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
