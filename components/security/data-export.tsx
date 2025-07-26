'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  FileText, 
  MessageSquare, 
  User, 
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedSize: string;
  recordCount: number;
}

interface DataExportProps {
  className?: string;
}

export function DataExport({ className }: DataExportProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<'idle' | 'preparing' | 'exporting' | 'complete' | 'error'>('idle');

  const dataCategories: DataCategory[] = [
    {
      id: 'profile',
      name: 'Profile Information',
      description: 'Personal details, preferences, and account settings',
      icon: User,
      estimatedSize: '2 KB',
      recordCount: 1
    },
    {
      id: 'documents',
      name: 'Documents',
      description: 'All uploaded documents and metadata',
      icon: FileText,
      estimatedSize: '45 MB',
      recordCount: 23
    },
    {
      id: 'conversations',
      name: 'Chat Conversations',
      description: 'AI chat history and conversation data',
      icon: MessageSquare,
      estimatedSize: '1.2 MB',
      recordCount: 156
    },
    {
      id: 'activity',
      name: 'Activity Logs',
      description: 'Login history and platform usage data',
      icon: Shield,
      estimatedSize: '500 KB',
      recordCount: 89
    },
    {
      id: 'settings',
      name: 'Settings & Preferences',
      description: 'Application settings and customizations',
      icon: Settings,
      estimatedSize: '1 KB',
      recordCount: 12
    }
  ];

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAll = () => {
    setSelectedCategories(dataCategories.map(cat => cat.id));
  };

  const selectNone = () => {
    setSelectedCategories([]);
  };

  const startExport = async () => {
    if (selectedCategories.length === 0) return;

    setIsExporting(true);
    setExportStatus('preparing');
    setExportProgress(0);

    try {
      // Simulate export process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setExportProgress(i);
        
        if (i === 30) setExportStatus('exporting');
        if (i === 100) setExportStatus('complete');
      }

      // In a real implementation, this would trigger the actual export
      console.log('Exporting categories:', selectedCategories);
      
    } catch (error) {
      setExportStatus('error');
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadExport = () => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#'; // In real implementation, this would be the download URL
    link.download = `data-export-${new Date().toISOString().split('T')[0]}.zip`;
    link.click();
  };

  const getStatusIcon = () => {
    switch (exportStatus) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'preparing':
      case 'exporting':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      default:
        return <Download className="h-5 w-5" />;
    }
  };

  const getStatusMessage = () => {
    switch (exportStatus) {
      case 'preparing':
        return 'Preparing your data for export...';
      case 'exporting':
        return 'Exporting your data...';
      case 'complete':
        return 'Export completed successfully!';
      case 'error':
        return 'Export failed. Please try again.';
      default:
        return 'Select the data you want to export';
    }
  };

  const selectedSize = dataCategories
    .filter(cat => selectedCategories.includes(cat.id))
    .reduce((total, cat) => {
      const size = parseFloat(cat.estimatedSize);
      const unit = cat.estimatedSize.includes('MB') ? 1024 : 1;
      return total + (size * unit);
    }, 0);

  const selectedRecords = dataCategories
    .filter(cat => selectedCategories.includes(cat.id))
    .reduce((total, cat) => total + cat.recordCount, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Your Data
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Download a copy of all your personal data stored in the platform
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          {getStatusIcon()}
          <div>
            <p className="font-medium text-sm">{getStatusMessage()}</p>
            {exportStatus === 'complete' && (
              <p className="text-xs text-muted-foreground">
                Your data export is ready for download
              </p>
            )}
          </div>
        </div>

        {/* Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Export Progress</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} />
          </div>
        )}

        {/* Category Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Select Data Categories</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={selectNone}>
                Select None
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {dataCategories.map((category) => (
              <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                  disabled={isExporting}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <category.icon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor={category.id} className="font-medium cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{category.recordCount} records</span>
                    <span>{category.estimatedSize}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Summary */}
        {selectedCategories.length > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Export Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-200">Categories:</span>
                <span className="ml-2 font-medium">{selectedCategories.length}</span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-200">Records:</span>
                <span className="ml-2 font-medium">{selectedRecords.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-200">Est. Size:</span>
                <span className="ml-2 font-medium">
                  {selectedSize >= 1024 ? `${(selectedSize / 1024).toFixed(1)} MB` : `${selectedSize.toFixed(0)} KB`}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-200">Format:</span>
                <span className="ml-2 font-medium">ZIP Archive</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {exportStatus === 'complete' ? (
            <Button onClick={downloadExport} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Export
            </Button>
          ) : (
            <Button 
              onClick={startExport} 
              disabled={selectedCategories.length === 0 || isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Start Export
                </>
              )}
            </Button>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-900 dark:text-green-100">Privacy Protected</p>
              <p className="text-green-700 dark:text-green-200">
                Your data export is processed locally and securely. No external services are used.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}