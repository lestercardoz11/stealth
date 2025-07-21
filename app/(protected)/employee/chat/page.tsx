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
      <div className='flex-1 overflow-hidden'>
        <RAGChatInterface />
      </div>
    </div>
  );
}
