'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Database, Check, AlertCircle, Trash2, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataRetentionConfig {
  autoDeleteEnabled: boolean;
  documentRetentionDays: string;
  chatRetentionDays: string;
  logRetentionDays: string;
  backupRetentionDays: string;
  deletedItemsRetentionDays: string;
  anonymizeAfterDays: string;
  compressionEnabled: boolean;
  archiveOldData: boolean;
}

export function DataRetentionSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [config, setConfig] = useState<DataRetentionConfig>({
    autoDeleteEnabled: false,
    documentRetentionDays: '365',
    chatRetentionDays: '90',
    logRetentionDays: '30',
    backupRetentionDays: '90',
    deletedItemsRetentionDays: '30',
    anonymizeAfterDays: '1095',
    compressionEnabled: true,
    archiveOldData: true,
  });

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would save to your backend/database
      localStorage.setItem('dataRetentionConfig', JSON.stringify(config));
      
      setMessage({ type: 'success', text: 'Data retention settings saved successfully!' });
    } catch {
      setMessage({ 
        type: 'error', 
        text: 'Failed to save data retention settings' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataCleanup = async () => {
    setMessage({ type: 'success', text: 'Data cleanup process initiated. This may take several minutes.' });
  };

  const updateConfig = (key: keyof DataRetentionConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const retentionPolicies = [
    {
      title: 'Documents',
      key: 'documentRetentionDays' as keyof DataRetentionConfig,
      description: 'How long to keep uploaded documents',
      icon: '📄',
    },
    {
      title: 'Chat Messages',
      key: 'chatRetentionDays' as keyof DataRetentionConfig,
      description: 'How long to keep chat conversation history',
      icon: '💬',
    },
    {
      title: 'System Logs',
      key: 'logRetentionDays' as keyof DataRetentionConfig,
      description: 'How long to keep system and audit logs',
      icon: '📋',
    },
    {
      title: 'Backups',
      key: 'backupRetentionDays' as keyof DataRetentionConfig,
      description: 'How long to keep system backups',
      icon: '💾',
    },
    {
      title: 'Deleted Items',
      key: 'deletedItemsRetentionDays' as keyof DataRetentionConfig,
      description: 'How long to keep deleted items in trash',
      icon: '🗑️',
    },
  ];

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">General Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure automatic data retention policies
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Automatic Data Deletion</Label>
              <p className="text-sm text-muted-foreground">
                Automatically delete data based on retention policies
              </p>
            </div>
            <Switch
              checked={config.autoDeleteEnabled}
              onCheckedChange={(checked) => updateConfig('autoDeleteEnabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Data Compression</Label>
              <p className="text-sm text-muted-foreground">
                Compress old data to save storage space
              </p>
            </div>
            <Switch
              checked={config.compressionEnabled}
              onCheckedChange={(checked) => updateConfig('compressionEnabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Archive Old Data</Label>
              <p className="text-sm text-muted-foreground">
                Move old data to long-term archive storage
              </p>
            </div>
            <Switch
              checked={config.archiveOldData}
              onCheckedChange={(checked) => updateConfig('archiveOldData', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Retention Policies */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Retention Policies</h3>
          <p className="text-sm text-muted-foreground">
            Set how long different types of data are kept
          </p>
        </div>
        
        <div className="grid gap-4">
          {retentionPolicies.map((policy) => (
            <div key={policy.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{policy.icon}</span>
                <div>
                  <Label className="font-medium">{policy.title}</Label>
                  <p className="text-sm text-muted-foreground">{policy.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={config[policy.key] as string}
                  onChange={(e) => updateConfig(policy.key, e.target.value)}
                  className="w-20"
                  min="1"
                  disabled={!config.autoDeleteEnabled}
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Privacy Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Privacy & Anonymization</h3>
          <p className="text-sm text-muted-foreground">
            Configure data anonymization for privacy compliance
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="anonymizeAfterDays">Anonymize Personal Data After (days)</Label>
          <Input
            id="anonymizeAfterDays"
            type="number"
            value={config.anonymizeAfterDays}
            onChange={(e) => updateConfig('anonymizeAfterDays', e.target.value)}
            min="30"
            max="3650"
            className="w-32"
          />
          <p className="text-xs text-muted-foreground">
            Personal identifiers will be removed after this period for compliance
          </p>
        </div>
      </div>

      <Separator />

      {/* Storage Overview */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Storage Overview</h3>
          <p className="text-sm text-muted-foreground">
            Current storage usage and projections
          </p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Total Storage</span>
              </div>
              <div className="text-2xl font-bold">2.4 GB</div>
              <p className="text-sm text-muted-foreground">Used of 10 GB limit</p>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-green-600" />
                <span className="font-medium">Archived Data</span>
              </div>
              <div className="text-2xl font-bold">850 MB</div>
              <p className="text-sm text-muted-foreground">In long-term storage</p>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Eligible for Cleanup</span>
              </div>
              <div className="text-2xl font-bold">320 MB</div>
              <p className="text-sm text-muted-foreground">Can be safely deleted</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Data Management Actions */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Data Management Actions</h3>
          <p className="text-sm text-muted-foreground">
            Perform immediate data management operations
          </p>
        </div>
        
        <div className="flex gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Run Data Cleanup
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Run Data Cleanup</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete data that exceeds the retention policies.
                  This action cannot be undone. Are you sure you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDataCleanup}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Run Cleanup
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archive Old Data
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <Card className={cn(
          "border",
          message.type === 'success' ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <p className={cn(
                "text-sm",
                message.type === 'success' ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
              )}>
                {message.text}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Saving Retention Settings...
          </>
        ) : (
          <>
            <Database className="h-4 w-4 mr-2" />
            Save Retention Settings
          </>
        )}
      </Button>
    </div>
  );
}