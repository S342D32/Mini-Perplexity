import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

// API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Enhanced search result interface
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
  publishedDate?: string;
}

// Tavily search function for real web search with live websites
async function searchWeb(query: string): Promise<SearchResult[]> {
  console.log(`Starting web search for query: "${query}"`);

  if (!TAVILY_API_KEY) {
    console.log("TAVILY_API_KEY not found, using mock results");
    return generateMockResults(query);
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query: query,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: true,
        max_results: 6,
        include_domains: [
          "reuters.com",
          "bbc.com",
          "cnn.com",
          "npr.org",
          "apnews.com",
          "techcrunch.com",
          "theverge.com",
        ],
        exclude_domains: [
          "pinterest.com",
          "instagram.com",
          "facebook.com",
          "twitter.com",
        ],
        include_images: false,
        days: 30,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Tavily API error: ${response.status} - ${errorText}`);
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Tavily API response received, processing results...");

    // Process real search results from live websites
    const results: SearchResult[] =
      data.results?.map((result: any) => ({
        title: result.title || "Untitled",
        url: result.url || "#",
        snippet: result.content || result.snippet || "No content available",
        score: result.score || 0.5,
        publishedDate: result.published_date,
      })) || [];

    if (results.length === 0) {
      console.log("No results found, returning fallback");
      return generateFallbackResults(query);
    }

    console.log(`Found ${results.length} search results`);
    return results;
  } catch (error) {
    console.error("Tavily search error:", error);
    return generateFallbackResults(query);
  }
}

// Generate mock results for development/fallback
function generateMockResults(query: string): SearchResult[] {
  const queryLower = query.toLowerCase();

  if (
    queryLower.includes("ai") ||
    queryLower.includes("artificial intelligence")
  ) {
    return [
      {
        title: "OpenAI - Artificial Intelligence Research",
        url: "https://openai.com",
        snippet:
          "OpenAI is an AI research and deployment company. Our mission is to ensure that artificial general intelligence benefits all of humanity.",
        score: 0.95,
      },
      {
        title: "Google AI - Machine Learning Research",
        url: "https://ai.google",
        snippet:
          "Google AI is advancing the state of the art in machine learning and making AI helpful for everyone.",
        score: 0.9,
      },
    ];
  } else if (queryLower.includes("tech") || queryLower.includes("technology")) {
    return [
      {
        title: "TechCrunch - Latest Technology News",
        url: "https://techcrunch.com",
        snippet:
          "TechCrunch is a leading technology media property, dedicated to obsessively profiling startups, reviewing new Internet products, and breaking tech news.",
        score: 0.92,
      },
      {
        title: "Wired - Technology, Science, Culture",
        url: "https://wired.com",
        snippet:
          "WIRED is where tomorrow is realized. It is the essential source of information and ideas that make sense of a world in constant transformation.",
        score: 0.88,
      },
    ];
  } else {
    return [
      {
        title: `Wikipedia - ${query}`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        snippet: `Wikipedia article about "${query}" with comprehensive information from reliable sources.`,
        score: 0.85,
      },
      {
        title: `Latest News about ${query}`,
        url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Recent news articles and updates about "${query}" from various news sources.`,
        score: 0.8,
      },
    ];
  }
}

// Generate fallback results when search fails
function generateFallbackResults(query: string): SearchResult[] {
  return [
    {
      title: `Search "${query}" on Google`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      snippet: `I encountered an issue while searching. You can search for "${query}" on Google for the latest information.`,
      score: 0.4,
    },
    {
      title: `Wikipedia - ${query}`,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
      snippet: `Check Wikipedia for comprehensive information about "${query}".`,
      score: 0.3,
    },
  ];
}

// Generate AI response using Gemini
async function generateAIResponse(
  message: string,
  searchContext: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured");
    return "I apologize, but the AI service is not properly configured. Please check the API key configuration.";
  }

  const prompt = `
You are Mini Perplexity, an AI search assistant. Provide a comprehensive, conversational, and well-structured answer based on the search results.

✨ FORMATTING RULES:
- Start directly with the answer (no greetings or intros like "Hi" or "Hello")
- Use section headers with emojis (no bold or asterisks)
- Use bullet points (-) for lists
- Do NOT use **bold** or *italic* Markdown formatting
- For emphasis, use CAPITAL LETTERS or surround text with emojis instead
- Keep answers friendly, simple, and easy to read
- Add proper line breaks for readability
- Avoid Markdown symbols like ** or *

Search Results:
${searchContext}

User Question: ${message}

Now write the final answer in a friendly tone, using emojis and structured formatting without Markdown bold/italic.
`;

  try {
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(
        `Gemini API error: ${geminiResponse.status} - ${errorText}`
      );
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error("No response received from Gemini API");
    }

    return aiResponse;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I apologize, but I couldn't generate a response at this time. Please try again.";
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log("🚀 Chat API request received");

  try {
    // Step 1: Authentication
    console.log("🔐 Checking authentication...");
    const session = await auth();

    if (!session?.user?.email) {
      console.error("❌ Authentication failed: No session or user email found");
      return NextResponse.json(
        {
          error: "Authentication required. Please sign in to continue.",
          response: "Please sign in to use the chat feature.",
          sources: [],
        },
        { status: 401 }
      );
    }

    console.log("✅ User authenticated:", session.user.email);

    // Step 2: Validate request body
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      console.error("❌ Invalid message provided");
      return NextResponse.json(
        {
          error: "Message is required and cannot be empty",
          response: "Please provide a valid message.",
          sources: [],
        },
        { status: 400 }
      );
    }

    console.log("📝 Processing message:", message.substring(0, 50) + "...");
    console.log("🔗 Session ID:", sessionId || "none");

    // Step 3: Search the web for relevant information
    console.log("🔍 Starting web search...");
    const searchResults = await searchWeb(message.trim());

    // Step 4: Prepare context from search results
    const searchContext = searchResults
      .map((result) => `Source: ${result.title}\nContent: ${result.snippet}`)
      .join("\n\n");

    console.log("📊 Search context prepared, length:", searchContext.length);

    // Step 5: Generate AI response
    console.log("🤖 Generating AI response...");
    const aiResponse = await generateAIResponse(message, searchContext);

    const responseTime = Date.now() - startTime;
    console.log(`✅ Request completed in ${responseTime}ms`);

    // Step 6: Return successful response
    return NextResponse.json({
      response: aiResponse,
      sources: searchResults,
      sessionId: sessionId || null,
      userId: session.user.email,
      responseTime: responseTime,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error("❌ Chat API error:", error);
    console.error(`Request failed after ${responseTime}ms`);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Gemini API")) {
        return NextResponse.json(
          {
            error: "AI service temporarily unavailable",
            response:
              "I'm experiencing some technical difficulties with the AI service. Please try again in a moment.",
            sources: [],
          },
          { status: 200 } // Return 200 to show the error message in chat
        );
      }

      if (error.message.includes("Tavily API")) {
        return NextResponse.json(
          {
            error: "Search service temporarily unavailable",
            response:
              "I'm having trouble searching for information right now. Please try again later.",
            sources: [],
          },
          { status: 200 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Internal server error",
        response:
          "I apologize, but I encountered an unexpected error. Please try again.",
        sources: [],
      },
      { status: 200 } // Return 200 to show the error message in chat
    );
  }
}
