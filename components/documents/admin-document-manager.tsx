'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Building2, User, Loader2 } from 'lucide-react';
import { Document } from '@/lib/types/database';
import { DocumentFilters, DocumentSearch } from './document-search';
import { DocumentUpload } from './document-upload';
import { DocumentViewer } from './document-viewer';
import { DocumentCard } from './document-card';
import { getDocuments } from '@/lib/storage/document-api';

export function AdminDocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [filters, setFilters] = useState<DocumentFilters>({
    search: '',
    type: 'all',
    fileType: 'all',
    sortBy: 'newest',
  });

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const result = await getDocuments(); // Get all documents for admin
      if (result.success) {
        setDocuments(result.documents || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Filter and sort documents
  useEffect(() => {
    let filtered = [...documents];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter((doc) =>
        filters.type === 'company' ? doc.is_company_wide : !doc.is_company_wide
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

  const handleRefreshDocuments = async () => {
    setIsLoading(true);
    await loadDocuments();
    setIsLoading(false);
  };

  const handleDocumentDelete = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const handleDocumentView = (doc: Document) => {
    setSelectedDocument(doc);
    setIsViewerOpen(true);
  };

  const handleUploadComplete = () => {
    loadDocuments(); // Refresh documents after upload
    setShowUpload(false); // Hide upload section
  };

  const stats = {
    total: documents.length,
    company: documents.filter((doc) => doc.is_company_wide).length,
    personal: documents.filter((doc) => !doc.is_company_wide).length,
  };

  if (isInitialLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto' />
          <p className='text-muted-foreground'>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Total Documents</p>
                <p className='text-2xl font-bold'>{stats.total}</p>
              </div>
              <FileText className='h-8 w-8 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Company-wide</p>
                <p className='text-2xl font-bold'>{stats.company}</p>
              </div>
              <Building2 className='h-8 w-8 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Personal</p>
                <p className='text-2xl font-bold'>{stats.personal}</p>
              </div>
              <User className='h-8 w-8 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>
      </div>

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
            onClick={handleRefreshDocuments}
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
      {showUpload && (
        <DocumentUpload
          allowCompanyWide={true}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Search and Filters */}
      <DocumentSearch
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredDocuments.length}
      />

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className='p-12 text-center'>
            <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No documents found</h3>
            <p className='text-muted-foreground mb-4'>
              {filters.search ||
              filters.type !== 'all' ||
              filters.fileType !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Upload your first doc to get started'}
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
              showOwner={true}
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
