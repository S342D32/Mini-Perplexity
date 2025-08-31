'use client';

import { useState } from 'react';
import {ChatInterface } from '../(overview)/components/chat-interface';

export default function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

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
