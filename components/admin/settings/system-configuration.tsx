'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Server, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemConfig {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxFileSize: string;
  sessionTimeout: string;
  logLevel: string;
  backupFrequency: string;
  emailProvider: string;
  storageProvider: string;
}

export function SystemConfiguration() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [config, setConfig] = useState<SystemConfig>({
    siteName: 'Stealth AI Platform',
    siteDescription: 'Private LLM platform for law firms',
    maintenanceMode: false,
    registrationEnabled: true,
    maxFileSize: '50',
    sessionTimeout: '24',
    logLevel: 'info',
    backupFrequency: 'daily',
    emailProvider: 'supabase',
    storageProvider: 'supabase',
  });

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would save to your backend/database
      localStorage.setItem('systemConfig', JSON.stringify(config));
      
      setMessage({ type: 'success', text: 'System configuration saved successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to save system configuration' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (key: keyof SystemConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">General Settings</h3>
          <p className="text-sm text-muted-foreground">
            Basic platform configuration
          </p>
        </div>
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={config.siteName}
              onChange={(e) => updateConfig('siteName', e.target.value)}
              placeholder="Enter site name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={config.siteDescription}
              onChange={(e) => updateConfig('siteDescription', e.target.value)}
              placeholder="Enter site description"
              rows={3}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* System Controls */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">System Controls</h3>
          <p className="text-sm text-muted-foreground">
            Control system-wide features and access
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily disable access for maintenance
              </p>
            </div>
            <Switch
              checked={config.maintenanceMode}
              onCheckedChange={(checked) => updateConfig('maintenanceMode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>User Registration</Label>
              <p className="text-sm text-muted-foreground">
                Allow new users to register accounts
              </p>
            </div>
            <Switch
              checked={config.registrationEnabled}
              onCheckedChange={(checked) => updateConfig('registrationEnabled', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* File & Session Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">File & Session Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure file uploads and user sessions
          </p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              value={config.maxFileSize}
              onChange={(e) => updateConfig('maxFileSize', e.target.value)}
              min="1"
              max="100"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={config.sessionTimeout}
              onChange={(e) => updateConfig('sessionTimeout', e.target.value)}
              min="1"
              max="168"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* System Monitoring */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">System Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Configure logging and backup settings
          </p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="logLevel">Log Level</Label>
            <Select value={config.logLevel} onValueChange={(value) => updateConfig('logLevel', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="backupFrequency">Backup Frequency</Label>
            <Select value={config.backupFrequency} onValueChange={(value) => updateConfig('backupFrequency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Service Providers */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Service Providers</h3>
          <p className="text-sm text-muted-foreground">
            Configure external service integrations
          </p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="emailProvider">Email Provider</Label>
            <Select value={config.emailProvider} onValueChange={(value) => updateConfig('emailProvider', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supabase">Supabase</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
                <SelectItem value="ses">Amazon SES</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="storageProvider">Storage Provider</Label>
            <Select value={config.storageProvider} onValueChange={(value) => updateConfig('storageProvider', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supabase">Supabase Storage</SelectItem>
                <SelectItem value="s3">Amazon S3</SelectItem>
                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                <SelectItem value="azure">Azure Blob Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            Saving Configuration...
          </>
        ) : (
          <>
            <Server className="h-4 w-4 mr-2" />
            Save Configuration
          </>
        )}
      </Button>
    </div>
  );
}