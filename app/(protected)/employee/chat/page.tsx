import { requireApprovedUser } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { RAGChatInterface } from '@/components/chat/rag-chat-interface';
import { getChatDocuments } from '@/lib/profile-actions';

async function sendChatMessage(messages: any[], documentIds: string[]) {
  'use server';
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000'}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      documentIds,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get response');
  }

  const data = await response.json();
  
  // Extract sources from response headers
  const sourcesHeader = response.headers.get('X-Sources');
  let sources = [];
  if (sourcesHeader) {
    try {
      sources = JSON.parse(sourcesHeader);
    } catch (e) {
      console.error('Error parsing sources:', e);
    }
  }

  return {
    response: data.response,
    sources: data.sources || sources,
  };
}
export default async function ChatPage() {
  try {
    await requireApprovedUser();
  } catch {
    redirect('/auth/access-denied?reason=Account pending approval');
  }

  const availableDocuments = await getChatDocuments();

  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 overflow-hidden'>
        <RAGChatInterface 
          availableDocuments={availableDocuments}
          onSendMessage={sendChatMessage}
        />
      </div>
    </div>
  );
}
