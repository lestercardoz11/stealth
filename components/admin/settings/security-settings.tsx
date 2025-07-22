'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Shield, Check, AlertCircle, Key, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityConfig {
  twoFactorRequired: boolean;
  passwordMinLength: string;
  passwordComplexity: boolean;
  sessionTimeout: string;
  maxLoginAttempts: string;
  lockoutDuration: string;
  ipWhitelisting: boolean;
  auditLogging: boolean;
  encryptionLevel: string;
  sslRequired: boolean;
}

export function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [config, setConfig] = useState<SecurityConfig>({
    twoFactorRequired: false,
    passwordMinLength: '8',
    passwordComplexity: true,
    sessionTimeout: '24',
    maxLoginAttempts: '5',
    lockoutDuration: '30',
    ipWhitelisting: false,
    auditLogging: true,
    encryptionLevel: 'aes256',
    sslRequired: true,
  });

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would save to your backend/database
      localStorage.setItem('securityConfig', JSON.stringify(config));
      
      setMessage({ type: 'success', text: 'Security settings saved successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to save security settings' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (key: keyof SecurityConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Authentication Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Configure user authentication requirements
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all user accounts
              </p>
            </div>
            <Switch
              checked={config.twoFactorRequired}
              onCheckedChange={(checked) => updateConfig('twoFactorRequired', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Password Complexity</Label>
              <p className="text-sm text-muted-foreground">
                Require uppercase, lowercase, numbers, and symbols
              </p>
            </div>
            <Switch
              checked={config.passwordComplexity}
              onCheckedChange={(checked) => updateConfig('passwordComplexity', checked)}
            />
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
            <Input
              id="passwordMinLength"
              type="number"
              value={config.passwordMinLength}
              onChange={(e) => updateConfig('passwordMinLength', e.target.value)}
              min="6"
              max="32"
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

      {/* Access Control */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Access Control</h3>
          <p className="text-sm text-muted-foreground">
            Configure login attempts and account lockout
          </p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
            <Input
              id="maxLoginAttempts"
              type="number"
              value={config.maxLoginAttempts}
              onChange={(e) => updateConfig('maxLoginAttempts', e.target.value)}
              min="3"
              max="10"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
            <Input
              id="lockoutDuration"
              type="number"
              value={config.lockoutDuration}
              onChange={(e) => updateConfig('lockoutDuration', e.target.value)}
              min="5"
              max="1440"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>IP Whitelisting</Label>
            <p className="text-sm text-muted-foreground">
              Restrict access to specific IP addresses
            </p>
          </div>
          <Switch
            checked={config.ipWhitelisting}
            onCheckedChange={(checked) => updateConfig('ipWhitelisting', checked)}
          />
        </div>
      </div>

      <Separator />

      {/* Data Protection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Data Protection</h3>
          <p className="text-sm text-muted-foreground">
            Configure encryption and data security
          </p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="encryptionLevel">Encryption Level</Label>
            <Select value={config.encryptionLevel} onValueChange={(value) => updateConfig('encryptionLevel', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aes128">AES-128</SelectItem>
                <SelectItem value="aes256">AES-256</SelectItem>
                <SelectItem value="rsa2048">RSA-2048</SelectItem>
                <SelectItem value="rsa4096">RSA-4096</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>SSL/TLS Required</Label>
              <p className="text-sm text-muted-foreground">
                Force HTTPS for all connections
              </p>
            </div>
            <Switch
              checked={config.sslRequired}
              onCheckedChange={(checked) => updateConfig('sslRequired', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Audit Logging</Label>
              <p className="text-sm text-muted-foreground">
                Log all security-related events
              </p>
            </div>
            <Switch
              checked={config.auditLogging}
              onCheckedChange={(checked) => updateConfig('auditLogging', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Security Status */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Security Status</h3>
          <p className="text-sm text-muted-foreground">
            Current security configuration overview
          </p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4">
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium">Security Score</span>
              </div>
              <div className="text-2xl font-bold text-green-600">85/100</div>
              <p className="text-sm text-muted-foreground">Good security posture</p>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Active Sessions</span>
              </div>
              <div className="text-2xl font-bold">24</div>
              <p className="text-sm text-muted-foreground">Currently logged in users</p>
            </CardContent>
          </Card>
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
            Saving Security Settings...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Save Security Settings
          </>
        )}
      </Button>
    </div>
  );
}