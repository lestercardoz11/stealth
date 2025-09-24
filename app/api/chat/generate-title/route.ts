import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { generateConversationTitle } from '@/lib/ai/ollama-client';

interface Message {
  role: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      conversationId,
      messages,
    }: { conversationId: string; messages: Message[] } = await request.json();

    if (!conversationId || !messages || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Check if user is authenticated and approved
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user profile and status
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role, email')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'approved') {
      return NextResponse.json(
        { error: 'Account not approved' },
        { status: 403 }
      );
    }

    // Verify user owns this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation || conversation.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const conversationText = messages
      .map((msg: Message) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const cleanTitle = await generateConversationTitle(conversationText);

    // Update conversation title in database
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ title: cleanTitle })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation title:', updateError);
      return NextResponse.json(
        { error: 'Failed to update title' },
        { status: 500 }
      );
    }

    return NextResponse.json({ title: cleanTitle });
  } catch (error) {
    console.error('Generate title error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
