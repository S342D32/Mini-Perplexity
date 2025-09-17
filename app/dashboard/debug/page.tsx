"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [clientInfo, setClientInfo] = useState<any>({})

  useEffect(() => {
    setClientInfo({
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      sessionStatus: status,
      hasSession: !!session,
      userEmail: session?.user?.email,
    })
  }, [session, status])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify({
              status,
              hasSession: !!session,
              userEmail: session?.user?.email,
              userId: session?.user?.id,
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Client Information</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(clientInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">API Test</h2>
          <button 
            onClick={async () => {
              try {
                const response = await fetch('/api/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: 'test' })
                })
                const data = await response.json()
                console.log('API Response:', data)
                alert('API test successful - check console')
              } catch (error) {
                console.error('API Error:', error)
                alert('API test failed - check console')
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Chat API
          </button>
        </div>
      </div>
    </div>
  )
}