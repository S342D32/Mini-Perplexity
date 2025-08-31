import { NextRequest, NextResponse } from 'next/server'

// API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const TAVILY_API_KEY = process.env.TAVILY_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Tavily search function for real web search with live websites
async function searchWeb(query: string) {
  if (!TAVILY_API_KEY) {
    // Enhanced fallback with realistic examples based on query
    const queryLower = query.toLowerCase()
    let mockResults = []
    
    if (queryLower.includes('ai') || queryLower.includes('artificial intelligence')) {
      mockResults = [
        {
          title: "OpenAI - Artificial Intelligence Research",
          url: "https://openai.com",
          snippet: `OpenAI is an AI research and deployment company. Our mission is to ensure that artificial general intelligence benefits all of humanity.`,
          score: 0.95,
        },
        {
          title: "Google AI - Machine Learning Research",
          url: "https://ai.google",
          snippet: `Google AI is advancing the state of the art in machine learning and making AI helpful for everyone.`,
          score: 0.90,
        }
      ]
    } else if (queryLower.includes('tech') || queryLower.includes('technology')) {
      mockResults = [
        {
          title: "TechCrunch - Latest Technology News",
          url: "https://techcrunch.com",
          snippet: `TechCrunch is a leading technology media property, dedicated to obsessively profiling startups, reviewing new Internet products, and breaking tech news.`,
          score: 0.92,
        },
        {
          title: "Wired - Technology, Science, Culture",
          url: "https://wired.com",
          snippet: `WIRED is where tomorrow is realized. It is the essential source of information and ideas that make sense of a world in constant transformation.`,
          score: 0.88,
        }
      ]
    } else {
      mockResults = [
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
          score: 0.80,
        }
      ]
    }
    
    return mockResults
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query: query,
        search_depth: 'advanced',
        include_answer: true,
        include_raw_content: true,
        max_results: 6,
        include_domains: [
          'reuters.com', 'bbc.com', 'cnn.com', 'npr.org', 
          'apnews.com', 'techcrunch.com', 'theverge.com'
        ],
        exclude_domains: ['pinterest.com', 'instagram.com', 'facebook.com', 'twitter.com'],
        include_images: false,
        days: 30, // Only recent content
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Tavily API error: ${response.status} - ${errorText}`)
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Tavily API response:', JSON.stringify(data, null, 2))
    
    // Process real search results from live websites
    const results = data.results?.map((result: { 
      title: string; 
      url: string; 
      content?: string; 
      snippet?: string; 
      score?: number;
      published_date?: string;
    }) => ({
      title: result.title, // Removed emoji addition
      url: result.url, // This will be the actual live website URL
      snippet: result.content || result.snippet || 'No content available',
      score: result.score || 0.5,
      publishedDate: result.published_date,
    })) || []

    // If no results, return a helpful message
    if (results.length === 0) {
      return [
        {
          title: `No specific results found for "${query}"`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `No specific results were found. You can try searching on Google for more information about "${query}".`,
          score: 0.3,
        }
      ]
    }

    return results
    
  } catch (error) {
    console.error('Tavily search error:', error)
    // Return helpful fallback with real website suggestions
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
      }
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Step 1: Search the web for relevant information
    const searchResults = await searchWeb(message)
    
    // Step 2: Prepare context from search results
    const searchContext = searchResults
      .map((result: { title: string; snippet: string; url: string; score: number }) => `Source: ${result.title}\nContent: ${result.snippet}`)
      .join('\n\n')

    // Step 3: Generate AI response using Gemini API with clean formatting
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
`

    

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY || '',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response at this time."

    return NextResponse.json({
      response: aiResponse,
      sources: searchResults,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Handle specific Gemini API errors
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { 
          error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.',
          response: 'I apologize, but the AI service is not properly configured. Please check the API key configuration.',
          sources: []
        },
        { status: 200 } // Return 200 to show the error message in chat
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        response: 'I apologize, but I encountered an error while processing your request. Please try again.',
        sources: []
      },
      { status: 200 } // Return 200 to show the error message in chat
    )
  }
}
