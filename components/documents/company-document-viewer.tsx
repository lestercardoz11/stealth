'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DocumentSearch, DocumentFilters } from './document-search';
import { DocumentCard } from './document-card';
import { DocumentViewer } from './document-viewer';
import { Building2, Info } from 'lucide-react';
import { Document } from '@/lib/types/database';
import { Profile } from '@/lib/types/database';

interface CompanyDocumentViewerProps {
  documents: Document[];
  userProfile: Profile | null;
}

export function CompanyDocumentViewer({
  documents,
}: CompanyDocumentViewerProps) {
  const [filteredDocuments, setFilteredDocuments] =
    useState<Document[]>(documents);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const [filters, setFilters] = useState<DocumentFilters>({
    search: '',
    type: 'company', // Default to company documents only
    fileType: 'all',
    sortBy: 'newest',
  });

  // Filter and sort documents
  useEffect(() => {
    let filtered = [...documents];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply file type filter
    if (filters.fileType !== 'all') {
      filtered = filtered.filter((doc) => {
        if (!doc.file_type) return false;
        const fileType = doc.file_type.toLowerCase();
        switch (filters.fileType) {
          case 'pdf':
            return fileType.includes('pdf');
          case 'docx':
            return (
              fileType.includes('wordprocessingml') || fileType.includes('docx')
            );
          case 'doc':
            return (
              fileType.includes('msword') &&
              !fileType.includes('wordprocessingml')
            );
          case 'txt':
            return fileType.includes('text/plain');
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case 'name':
          return a.title.localeCompare(b.title);
        case 'size':
          return (b.file_size || 0) - (a.file_size || 0);
        case 'newest':
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    setFilteredDocuments(filtered);
  }, [documents, filters]);

  const handleDocumentView = (document: Document) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  return (
    <div className='space-y-6'>
      {/* Info Banner */}
      <Card className='bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'>
        <CardContent className='p-4'>
          <div className='flex items-start gap-3'>
            <Info className='h-5 w-5 text-blue-600 mt-0.5' />
            <div>
              <h3 className='text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1'>
                Company Documents
              </h3>
              <p className='text-xs text-blue-700 dark:text-blue-200'>
                These documents are available to all employees and can be used
                for AI analysis and research. You have read-only access to these
                documents.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters - Modified to hide type filter since we only show company docs */}
      <div className='space-y-4'>
        <DocumentSearch
          filters={{ ...filters, type: 'company' }} // Force company type
          onFiltersChange={(newFilters) =>
            setFilters({ ...newFilters, type: 'company' })
          }
          resultCount={filteredDocuments.length}
        />
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className='p-12 text-center'>
            <Building2 className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>
              No company documents found
            </h3>
            <p className='text-muted-foreground'>
              {filters.search || filters.fileType !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No company-wide documents have been uploaded yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              doc={document}
              onView={handleDocumentView}
              canDelete={false} // Employees cannot delete company documents
              canEdit={false} // Employees cannot edit company documents
              showOwner={false} // Don't show owner info for company docs
            />
          ))}
        </div>
      )}

      {/* Document Viewer */}
      <DocumentViewer
        doc={selectedDocument}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setSelectedDocument(null);
        }}
      />
    </div>
  );
}
