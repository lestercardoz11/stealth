import { requireApprovedUser } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { RAGChatInterface } from '@/components/chat/rag-chat-interface';

export default async function ChatPage() {
  try {
    await requireApprovedUser();
  } catch {
    redirect('/auth/access-denied?reason=Account pending approval');
  }

  return (
    <div className='h-full flex flex-col'>
      <div className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4'>
        <h1 className='text-2xl font-bold'>AI Chat</h1>
        <p className='text-muted-foreground'>Chat with your AI assistant about your documents</p>
      </div>
      <div className='flex-1 overflow-hidden'>
        <RAGChatInterface />
      </div>
    </div>
  );
}
