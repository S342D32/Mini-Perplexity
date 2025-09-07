'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from '../(overview)/components/chat-interface';

export default function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Generate UUID when component mounts if no session ID exists
  useEffect(() => {
    if (!currentSessionId) {
      setCurrentSessionId(crypto.randomUUID()); // Generate proper UUID
    }
  }, []);

  return (
    <div className="h-full">
      <ChatInterface
        currentSessionId={currentSessionId}
        onSessionChange={setCurrentSessionId}
        className="h-full"
      />
    </div>
  );
}
