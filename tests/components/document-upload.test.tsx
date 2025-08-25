import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentUpload } from '@/components/documents/document-upload';
import { uploadDocument } from '@/lib/storage/document-api';

// Mock the upload function
jest.mock('@/lib/storage/document-api');

const mockUploadDocument = uploadDocument as jest.MockedFunction<typeof uploadDocument>;

describe('DocumentUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area', () => {
    render(<DocumentUpload allowCompanyWide={true} />);
    
    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
    expect(screen.getByText('Drag & drop files here')).toBeInTheDocument();
    expect(screen.getByText('Supports PDF, DOCX, DOC, TXT files up to 50MB')).toBeInTheDocument();
  });

  it('shows privacy message', () => {
    render(<DocumentUpload allowCompanyWide={true} />);
    
    expect(screen.getByText(/Your documents are processed locally/)).toBeInTheDocument();
  });

  it('handles successful upload', async () => {
    mockUploadDocument.mockResolvedValue({
      success: true,
      message: 'Upload successful',
      document: {
        id: 'doc-1',
        title: 'Test Document',
        user_id: 'user-1',
        file_path: 'test.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        is_company_wide: false,
        created_at: '2024-01-01T00:00:00Z',
      },
    });

    const onUploadComplete = jest.fn();
    render(<DocumentUpload allowCompanyWide={true} onUploadComplete={onUploadComplete} />);
    
    // Simulate file drop
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const dropzone = screen.getByText('Drag & drop files here').closest('div');
    
    Object.defineProperty(dropzone, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.drop(dropzone!);

    await waitFor(() => {
      expect(mockUploadDocument).toHaveBeenCalledWith(file, 'test', true);
    });
  });

  it('handles upload errors', async () => {
    mockUploadDocument.mockResolvedValue({
      success: false,
      error: 'Upload failed',
    });

    render(<DocumentUpload allowCompanyWide={true} />);
    
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const dropzone = screen.getByText('Drag & drop files here').closest('div');
    
    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Upload failed/)).toBeInTheDocument();
    });
  });

  it('validates file types', () => {
    render(<DocumentUpload allowCompanyWide={true} />);
    
    const file = new File(['test'], 'test.exe', { type: 'application/x-executable' });
    const dropzone = screen.getByText('Drag & drop files here').closest('div');
    
    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(screen.getByText(/File type not supported/)).toBeInTheDocument();
  });
});