'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  FileText,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Building2,
  User,
  Calendar,
  HardDrive,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatFileSize, getFileIcon } from '@/lib/utils/file-validation';
import { Document } from '@/lib/types/database';
import { deleteDocument, getDocumentUrl } from '@/lib/storage/document-api';

interface DocumentCardProps {
  doc: Document;
  onDelete?: (documentId: string) => void;
  onView?: (doc: Document) => void;
  canDelete?: boolean;
  canEdit?: boolean;
  showOwner?: boolean;
}

export function DocumentCard({
  doc,
  onDelete,
  onView,
  canDelete = false,
}: DocumentCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async (): Promise<void> => {
    if (!doc.file_path) return;

    try {
      const result = await getDocumentUrl(doc.file_path);
      if (result.success && result.url) {
        const link = document.createElement('a');
        link.href = result.url;
        link.download = doc.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    try {
      const result = await deleteDocument(doc.id);
      if (result.success) {
        onDelete?.(doc.id);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleView = (): void => {
    onView?.(doc);
  };

  return (
    <>
      <Card className='hover:shadow-md transition-shadow cursor-pointer group'>
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3 flex-1 min-w-0'>
              <div className='text-2xl'>{getFileIcon(doc.file_type || '')}</div>
              <div className='flex-1 min-w-0'>
                <h3 className='font-semibold truncate group-hover:text-primary transition-colors'>
                  {doc.title}
                </h3>
                <div className='flex items-center gap-2 mt-1'>
                  <Badge
                    variant={doc.is_company_wide ? 'default' : 'secondary'}
                    className='text-xs'>
                    {doc.is_company_wide ? (
                      <>
                        <Building2 className='h-3 w-3 mr-1' />
                        Company
                      </>
                    ) : (
                      <>
                        <User className='h-3 w-3 mr-1' />
                        Personal
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='opacity-0 group-hover:opacity-100 transition-opacity'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={handleView}>
                  <Eye className='h-4 w-4 mr-2' />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className='h-4 w-4 mr-2' />
                  Download
                </DropdownMenuItem>
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className='text-red-600 focus:text-red-600'>
                    <Trash2 className='h-4 w-4 mr-2' />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className='pt-0'>
          <div className='space-y-2 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-3 w-3' />
              <span>
                {formatDistanceToNow(new Date(doc.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {doc.file_size && (
              <div className='flex items-center gap-2'>
                <HardDrive className='h-3 w-3' />
                <span>{formatFileSize(doc.file_size)}</span>
              </div>
            )}

            {doc.file_type && (
              <div className='flex items-center gap-2'>
                <FileText className='h-3 w-3' />
                <span className='uppercase text-xs'>
                  {doc.file_type
                    .split('/')
                    .pop()
                    ?.replace(
                      'vnd.openxmlformats-officedocument.wordprocessingml.doc',
                      'docx'
                    )}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete `{doc.title}`? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className='bg-red-600 hover:bg-red-700'>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
