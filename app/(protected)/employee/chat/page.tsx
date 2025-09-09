import { requireApprovedUser } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { getChatDocuments } from '@/lib/actions/profile-actions';
import { RAGChatInterface } from '@/components/chat/rag-chat-interface';

export default async function ChatPage() {
  // Handle authentication
  try {
    await requireApprovedUser();
  } catch {
    redirect('/auth/access-denied?reason=Account pending approval');
  }

  // Fetch initial data
  const availableDocuments = await getChatDocuments();

  return (
    <div className='flex flex-col h-full'>
      <RAGChatInterface availableDocuments={availableDocuments} />
    </div>
  );
}
