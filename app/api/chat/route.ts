import { NextRequest, NextResponse } from 'next/server'

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Mock Tavily search function (replace with actual Tavily API when ready)
async function searchWeb(query: string) {
  // This is a mock implementation
  // In production, replace with actual Tavily API call
  return [
    {
      title: "Example Search Result 1",
      url: "https://example.com/1",
      snippet: `Relevant information about "${query}" from a reliable source. This would contain actual search results in production.`,
    },
    {
      title: "Example Search Result 2", 
      url: "https://example.com/2",
      snippet: `Additional context and information about "${query}" from another authoritative source.`,
    },
  ]
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
      .map(result => `Source: ${result.title}\nContent: ${result.snippet}`)
      .join('\n\n')

    // Step 3: Generate AI response using Gemini API
    const prompt = `You are Mini Perplexity, an AI-powered search assistant. Your role is to provide comprehensive, accurate answers based on the search results provided.

Instructions:
- Synthesize information from the search results to provide a complete answer
- Be conversational and helpful
- Cite sources naturally in your response
- If the search results don't fully answer the question, acknowledge limitations
- Provide actionable insights when possible

Search Results:
${searchContext}

User Question: ${message}

Please provide a comprehensive answer based on the search results above.`

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
