'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  FileText, 
  Building2, 
  User, 
  Calendar,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  title: string;
  created_at: string;
  is_company_wide: boolean;
  user_id: string;
}

interface DocumentSelectorProps {
  documents: Document[];
  selected: string[];
  onSelect: (selected: string[]) => void;
}

export function DocumentSelector({ documents, selected, onSelect }: DocumentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'personal' | 'company'>('all');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'personal' && !doc.is_company_wide) ||
      (filter === 'company' && doc.is_company_wide);
    
    return matchesSearch && matchesFilter;
  });

  const handleDocumentToggle = (documentId: string) => {
    const newSelected = selected.includes(documentId)
      ? selected.filter(id => id !== documentId)
      : [...selected, documentId];
    
    onSelect(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = filteredDocuments.map(doc => doc.id);
    const allSelected = allIds.every(id => selected.includes(id));
    
    if (allSelected) {
      // Deselect all filtered documents
      onSelect(selected.filter(id => !allIds.includes(id)));
    } else {
      // Select all filtered documents
      const newSelected = [...new Set([...selected, ...allIds])];
      onSelect(newSelected);
    }
  };

  const selectedCount = selected.length;
  const filteredSelectedCount = filteredDocuments.filter(doc => 
    selected.includes(doc.id)
  ).length;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs h-6 px-2"
          >
            All
          </Button>
          <Button
            variant={filter === 'personal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('personal')}
            className="text-xs h-6 px-2"
          >
            <User className="h-3 w-3 mr-0.5" />
            Personal
          </Button>
          <Button
            variant={filter === 'company' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('company')}
            className="text-xs h-6 px-2"
          >
            <Building2 className="h-3 w-3 mr-0.5" />
            Company
          </Button>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
        <span className="text-xs text-muted-foreground">
          {selectedCount} document{selectedCount !== 1 ? 's' : ''} selected
        </span>
        
        {filteredDocuments.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs h-5 px-2"
          >
            {filteredSelectedCount === filteredDocuments.length ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Deselect All
              </>
            ) : (
              <>
                <Circle className="h-3 w-3 mr-1" />
                Select All
              </>
            )}
          </Button>
        )}
      </div>

      {/* Document List */}
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No documents match your search' : 'No documents available'}
            </p>
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <Card 
              key={document.id}
              className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
              className={`p-2 cursor-pointer transition-colors hover:bg-accent/30 border-0 ${
                selected.includes(document.id) ? 'bg-accent border-primary' : ''
              }`}
              onClick={() => handleDocumentToggle(document.id)}
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={selected.includes(document.id)}
                  onChange={() => handleDocumentToggle(document.id)}
                  className="mt-0.5 h-3 w-3"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                    <p className="text-xs font-medium truncate">
                      {document.title}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span className="truncate">
                      {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                    </span>
                    
                    <Badge 
                      variant={document.is_company_wide ? 'default' : 'secondary'}
                      className="text-xs px-1 py-0 h-4"
                    >
                      {document.is_company_wide ? (
                        <>
                          <Building2 className="h-2 w-2 mr-0.5" />
                          Company
                        </>
                      ) : (
                        <>
                          <User className="h-2 w-2 mr-0.5" />
                          Personal
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Context Info */}
      {selectedCount > 0 && (
        <div className="p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 Selected documents provide context for AI responses via vector search.
          </p>
        </div>
      )}
    </div>
  );
}