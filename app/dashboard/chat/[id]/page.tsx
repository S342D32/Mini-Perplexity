'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {ChatInterface} from '../../(overview)/components/chat-interface';

export default function ChatSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);

  useEffect(() => {
    setCurrentSessionId(sessionId);
  }, [sessionId]);

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
