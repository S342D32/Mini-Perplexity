"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function TestAuth() {
  const { data: session, status } = useSession()
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' })
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Creating account...')
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage('Account created successfully! You can now sign in.')
        setSignupData({ name: '', email: '', password: '' })
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Network error occurred')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Signing in...')
    
    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false
      })
      
      if (result?.error) {
        setMessage(`Login error: ${result.error}`)
      } else {
        setMessage('Signed in successfully!')
      }
    } catch (error) {
      setMessage('Login failed')
    }
  }

  if (status === "loading") return <p>Loading...</p>

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Authentication Test</h1>
      
      {session ? (
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold">Signed in as:</h2>
          <p>Email: {session.user?.email}</p>
          <p>Name: {session.user?.name}</p>
          <p>ID: {session.user?.id}</p>
          <button 
            onClick={() => signOut()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold mb-4">Sign Up</h2>
            <form onSubmit={handleSignup} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={signupData.name}
                onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={signupData.password}
                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                className="w-full p-2 border rounded"
                minLength={6}
                required
              />
              <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
                Sign Up
              </button>
            </form>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold mb-4">Sign In</h2>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}

      {message && (
        <div className="bg-yellow-100 p-4 rounded">
          <p>{message}</p>
        </div>
      )}
    </div>
  )
}