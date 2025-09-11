'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  Building2,
  User,
  Search,
  Calendar,
  HardDrive,
  Check,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatFileSize } from '@/lib/utils/file-validation';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  created_at: string;
  is_company_wide: boolean;
  user_id: string;
  file_size?: number;
  file_type?: string;
}

interface DocumentSelectorModalProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelectionChange: (documentIds: string[]) => void;
  children: React.ReactNode;
}

export function DocumentSelectorModal({
  documents,
  selectedDocuments,
  onSelectionChange,
  children,
}: DocumentSelectorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'personal' | 'company'>('all');

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'company' && doc.is_company_wide) ||
      (filter === 'personal' && !doc.is_company_wide);
    
    return matchesSearch && matchesFilter;
  });

  const handleDocumentToggle = (documentId: string) => {
    const newSelection = selectedDocuments.includes(documentId)
      ? selectedDocuments.filter(id => id !== documentId)
      : [...selectedDocuments, documentId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = filteredDocuments.map(doc => doc.id);
    onSelectionChange(allIds);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('text')) return '📃';
    return '📄';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Documents for Context
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Choose documents to provide context for your AI assistant
          </p>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="space-y-3 pb-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {(['all', 'personal', 'company'] as const).map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setFilter(filterType)}
                >
                  {filterType === 'personal' && <User className="h-3 w-3 mr-1" />}
                  {filterType === 'company' && <Building2 className="h-3 w-3 mr-1" />}
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Button>
              ))}
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleSelectAll}
                disabled={filteredDocuments.length === 0}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleClearAll}
                disabled={selectedDocuments.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Selection Summary */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{filteredDocuments.length} documents available</span>
            <span>{selectedDocuments.length} selected</span>
          </div>
        </div>

        {/* Document List */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-2 pr-3">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  {searchTerm ? 'No documents match your search' : 'No documents available'}
                </p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200",
                    selectedDocuments.includes(doc.id)
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-accent/30"
                  )}
                  onClick={() => handleDocumentToggle(doc.id)}
                >
                  <Checkbox
                    checked={selectedDocuments.includes(doc.id)}
                    onChange={() => handleDocumentToggle(doc.id)}
                    className="mt-0.5"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">{getFileIcon(doc.file_type)}</span>
                        <h4 className="text-xs font-medium truncate">{doc.title}</h4>
                      </div>
                      
                      <Badge
                        variant={doc.is_company_wide ? 'default' : 'secondary'}
                        className="text-xs px-1.5 py-0 h-4 shrink-0"
                      >
                        {doc.is_company_wide ? (
                          <>
                            <Building2 className="h-2.5 w-2.5 mr-1" />
                            Company
                          </>
                        ) : (
                          <>
                            <User className="h-2.5 w-2.5 mr-1" />
                            Personal
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        <span>
                          {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {doc.file_size && (
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-2.5 w-2.5" />
                          <span>{formatFileSize(doc.file_size)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            {selectedDocuments.length > 0 && (
              <span className="text-primary font-medium">
                {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected for RAG context
              </span>
            )}
          </div>
          
          <Button
            onClick={() => setIsOpen(false)}
            size="sm"
            className="h-7 px-3 text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}