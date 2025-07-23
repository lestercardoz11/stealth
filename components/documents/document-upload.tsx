'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { validateFile, formatFileSize } from '@/lib/utils/file-validation';
import { uploadDocument } from '@/lib/storage/document-api';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  onUploadComplete?: (success: boolean, message: string) => void;
  allowCompanyWide?: boolean;
  className?: string;
}

interface UploadingFile {
  file: File;
  title: string;
  isCompanyWide: boolean;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function DocumentUpload({
  onUploadComplete,
  allowCompanyWide = false,
  className,
}: DocumentUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]): void => {
      const validFiles = acceptedFiles.filter((file) => {
        const validation = validateFile(file);
        if (!validation.isValid) {
          onUploadComplete?.(false, validation.error || 'Invalid file');
          return false;
        }
        return true;
      });

      const newUploadingFiles = validFiles.map((file) => ({
        file,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        isCompanyWide: false,
        progress: 0,
        status: 'uploading' as const,
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Start uploads
      newUploadingFiles.forEach((uploadingFile, index) => {
        handleUpload(uploadingFile, uploadingFiles.length + index);
      });
    },
    [uploadingFiles.length, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleUpload = async (
    uploadingFile: UploadingFile,
    index: number
  ): Promise<void> => {
    try {
      const result = await uploadDocument(
        uploadingFile.file,
        uploadingFile.title,
        uploadingFile.isCompanyWide
      );

      setUploadingFiles((prev) =>
        prev.map((file, i) =>
          i === index
            ? {
                ...file,
                status: result.success ? 'success' : 'error',
                error: result.error,
                progress: 100,
              }
            : file
        )
      );

      onUploadComplete?.(
        result.success,
        result.message || result.error || (result.success ? 'Upload successful' : 'Upload failed')
      );
    } catch (error) {
      setUploadingFiles((prev) =>
        prev.map((file, i) =>
          i === index
            ? {
                ...file,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed',
                progress: 0,
              }
            : file
        )
      );
      onUploadComplete?.(false, 'Upload failed');
    }
  };

  const updateFileTitle = (index: number, title: string): void => {
    setUploadingFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, title } : file))
    );
  };

  const updateFileCompanyWide = (
    index: number,
    isCompanyWide: boolean
  ): void => {
    setUploadingFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, isCompanyWide } : file))
    );
  };

  const removeFile = (index: number): void => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCompleted = (): void => {
    setUploadingFiles((prev) =>
      prev.filter((file) => file.status === 'uploading')
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive || dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            )}>
            <input {...getInputProps()} />
            <Upload className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
            <h3 className='text-lg font-semibold mb-2'>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className='text-muted-foreground mb-4'>
              or click to browse files
            </p>
            <p className='text-sm text-muted-foreground'>
              Supports PDF, DOCX, DOC, TXT files up to 50MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Upload Progress</CardTitle>
            <Button
              variant='outline'
              size='sm'
              onClick={clearCompleted}
              disabled={!uploadingFiles.some((f) => f.status !== 'uploading')}>
              Clear Completed
            </Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            {uploadingFiles.map((uploadingFile, index) => (
              <div key={index} className='space-y-3 p-4 border rounded-lg'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3 flex-1'>
                    <File className='h-8 w-8 text-muted-foreground' />
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Input
                          value={uploadingFile.title}
                          onChange={(e) =>
                            updateFileTitle(index, e.target.value)
                          }
                          placeholder='Document title'
                          disabled={uploadingFile.status !== 'uploading'}
                          className='flex-1'
                        />
                        {uploadingFile.status === 'success' && (
                          <CheckCircle className='h-5 w-5 text-green-500' />
                        )}
                        {uploadingFile.status === 'error' && (
                          <AlertCircle className='h-5 w-5 text-red-500' />
                        )}
                        {uploadingFile.status === 'uploading' && (
                          <Loader2 className='h-5 w-5 animate-spin text-blue-500' />
                        )}
                      </div>

                      <div className='flex items-center justify-between text-sm text-muted-foreground'>
                        <span>{formatFileSize(uploadingFile.file.size)}</span>
                        <span>{uploadingFile.file.type}</span>
                      </div>

                      {allowCompanyWide && (
                        <div className='flex items-center space-x-2'>
                          <Checkbox
                            id={`company-wide-${index}`}
                            checked={uploadingFile.isCompanyWide}
                            onCheckedChange={(checked) =>
                              updateFileCompanyWide(index, checked as boolean)
                            }
                            disabled={uploadingFile.status !== 'uploading'}
                          />
                          <Label
                            htmlFor={`company-wide-${index}`}
                            className='text-sm'>
                            Make available company-wide
                          </Label>
                        </div>
                      )}

                      {uploadingFile.status === 'uploading' && (
                        <Progress
                          value={uploadingFile.progress}
                          className='w-full'
                        />
                      )}

                      {uploadingFile.status === 'error' &&
                        uploadingFile.error && (
                          <p className='text-sm text-red-500'>
                            {uploadingFile.error}
                          </p>
                        )}
                    </div>
                  </div>

                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => removeFile(index)}
                    disabled={uploadingFile.status === 'uploading'}>
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
