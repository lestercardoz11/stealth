'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  ExternalLink, 
  Building2, 
  User, 
  Calendar,
  HardDrive,
  FileText,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatFileSize } from '@/lib/utils/file-validation';
import { getDocumentUrl } from '@/lib/storage/supabase-storage';
import { Document } from '@/lib/types/database';

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentViewer({ document, isOpen, onClose }: DocumentViewerProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (document && isOpen && document.file_path) {
      loadDocumentUrl();
    }
  }, [document, isOpen]);

  const loadDocumentUrl = async (): Promise<void> => {
    if (!document?.file_path) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const url = await getDocumentUrl(document.file_path);
      setDocumentUrl(url);
    } catch (err) {
      setError('Failed to load document');
      console.error('Document load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (): Promise<void> => {
    if (!documentUrl || !document) return;
    
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = document.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = (): void => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl mb-2 truncate">
                {document.title}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                </div>
                {document.file_size && (
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-4 w-4" />
                    {formatFileSize(document.file_size)}
                  </div>
                )}
                <Badge 
                  variant={document.is_company_wide ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {document.is_company_wide ? (
                    <>
                      <Building2 className="h-3 w-3 mr-1" />
                      Company
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      Personal
                    </>
                  )}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!documentUrl}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                disabled={!documentUrl}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 mt-4">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading document...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-red-600 mb-2">{error}</p>
                <Button variant="outline" onClick={loadDocumentUrl}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {documentUrl && !isLoading && !error && (
            <div className="h-full">
              {document.file_type === 'application/pdf' ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-full border rounded-lg"
                  title={document.title}
                />
              ) : (
                <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/50">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Preview not available for this file type
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download to View
                      </Button>
                      <Button variant="outline" onClick={handleOpenInNewTab}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}