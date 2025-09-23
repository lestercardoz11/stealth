'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MessageSquare, Plus, MoreVertical, Trash2 } from 'lucide-react';
import { Conversation } from '@/lib/types/database';
import { cn } from '@/lib/utils/utils';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ConversationListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);

  const handleDeleteClick = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const truncateTitle = (title: string, maxLength: number = 35) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  return (
    <>
      <div className='w-72 h-screen flex flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        {/* Header and New Chat Button */}
        <div className='p-3 border-b shrink-0'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='text-sm font-semibold text-foreground flex items-center gap-2'>
              <MessageSquare className='h-4 w-4' />
              Conversations
            </h2>
            <Badge variant='secondary' className='text-xs px-2 py-0.5'>
              {conversations.length}
            </Badge>
          </div>

          <Button
            onClick={onNewConversation}
            size='sm'
            className='w-full h-8 text-xs'
            variant='outline'>
            <Plus className='h-3 w-3 mr-1' />
            New Chat
          </Button>
        </div>

        {/* Scrollable Conversation List */}
        <div className='flex-1 min-h-0'>
          <ScrollArea className='h-full'>
            <div className='space-y-0'>
              {conversations.length === 0 ? (
                <div className='text-center py-8 px-4'>
                  <MessageSquare className='h-8 w-8 text-muted-foreground/50 mx-auto mb-2' />
                  <p className='text-xs text-muted-foreground'>
                    No conversations yet
                  </p>
                  <p className='text-xs text-muted-foreground/70 mt-1'>
                    Start a new chat to begin
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      'cursor-pointer transition-all duration-200 border-0 bg-transparent hover:bg-accent/50 group',
                      selectedConversationId === conversation.id &&
                        'bg-accent border-accent-foreground/20'
                    )}
                    onClick={() => onSelectConversation(conversation)}>
                    <CardContent className='p-3'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-foreground leading-tight truncate'>
                            {truncateTitle(conversation.title || '') ||
                              'Untitled Conversation'}
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-3 w-3 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                              onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className='h-3 w-3' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-32'>
                            <DropdownMenuItem
                              onClick={(e) =>
                                handleDeleteClick(conversation.id, e)
                              }
                              className='text-red-600 focus:text-red-600 text-xs cursor-pointer'>
                              <Trash2 className='h-3 w-3 mr-2' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className='max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-base'>
              Delete Conversation
            </AlertDialogTitle>
            <AlertDialogDescription className='text-sm'>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='text-sm'>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-red-600 hover:bg-red-700 text-sm'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
