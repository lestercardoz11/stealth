'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentUpload } from './document-upload';
import { DocumentSearch, DocumentFilters } from './document-search';
import { DocumentCard } from './document-card';
import { DocumentViewer } from './document-viewer';
import { Upload, FileText, User, Loader2 } from 'lucide-react';
import { Document, Profile } from '@/lib/types/database';

interface EmployeeDocumentManagerProps {
  initialDocuments: Document[];
  userProfile: Profile;
  onRefreshDocuments: () => Promise<void>;
}

export function EmployeeDocumentManager({
  initialDocuments,
  onRefreshDocuments,
}: EmployeeDocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [filteredDocuments, setFilteredDocuments] =
    useState<Document[]>(initialDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState<DocumentFilters>({
    search: '',
    type: 'personal', // Default to personal documents for employees
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

  const refreshDocuments = async () => {
    setIsLoading(true);
    try {
      await onRefreshDocuments();
    } catch (error) {
      console.error('Error refreshing documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentDelete = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const handleDocumentView = (doc: Document) => {
    setSelectedDocument(doc);
    setIsViewerOpen(true);
  };

  return (
    <div className='space-y-6'>
      {/* Stats Card */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>My Documents</p>
              <p className='text-2xl font-bold'>{documents.length}</p>
            </div>
            <User className='h-8 w-8 text-muted-foreground' />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Button
            onClick={() => setShowUpload(!showUpload)}
            className='flex items-center gap-2'>
            <Upload className='h-4 w-4' />
            {showUpload ? 'Hide Upload' : 'Upload Documents'}
          </Button>
          <Button
            variant='outline'
            onClick={refreshDocuments}
            disabled={isLoading}>
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && <DocumentUpload allowCompanyWide={false} />}

      {/* Search and Filters - Hide type filter since employees only see their own docs */}
      <div className='space-y-4'>
        <DocumentSearch
          filters={{ ...filters, type: 'personal' }} // Force personal type
          onFiltersChange={(newFilters) =>
            setFilters({ ...newFilters, type: 'personal' })
          }
          resultCount={filteredDocuments.length}
        />
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className='p-12 text-center'>
            <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No documents found</h3>
            <p className='text-muted-foreground mb-4'>
              {filters.search || filters.fileType !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Upload your first document to get started'}
            </p>
            {!showUpload && (
              <Button onClick={() => setShowUpload(true)}>
                <Upload className='h-4 w-4 mr-2' />
                Upload Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDelete={handleDocumentDelete}
              onView={handleDocumentView}
              canDelete={true}
              canEdit={true}
              showOwner={false} // Don't show owner since it's always the current user
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
