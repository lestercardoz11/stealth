'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Palette, Check, AlertCircle, Upload, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandingConfig {
  companyName: string;
  companyLogo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCSS: string;
  footerText: string;
  loginMessage: string;
}

export function BrandingSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [config, setConfig] = useState<BrandingConfig>({
    companyName: 'Stealth AI',
    companyLogo: '',
    favicon: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#8b5cf6',
    fontFamily: 'Inter',
    customCSS: '',
    footerText: '© 2024 Stealth AI. All rights reserved.',
    loginMessage: 'Welcome to Stealth AI Platform',
  });

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would save to your backend/database
      localStorage.setItem('brandingConfig', JSON.stringify(config));
      
      setMessage({ type: 'success', text: 'Branding settings saved successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to save branding settings' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (key: keyof BrandingConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (key: 'companyLogo' | 'favicon') => {
    // In a real app, you would handle file upload here
    setMessage({ type: 'success', text: `${key === 'companyLogo' ? 'Logo' : 'Favicon'} upload functionality would be implemented here` });
  };

  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Source Sans Pro',
    'Poppins',
    'Nunito',
  ];

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Company Information</h3>
          <p className="text-sm text-muted-foreground">
            Basic company branding information
          </p>
        </div>
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={config.companyName}
              onChange={(e) => updateConfig('companyName', e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="loginMessage">Login Welcome Message</Label>
            <Input
              id="loginMessage"
              value={config.loginMessage}
              onChange={(e) => updateConfig('loginMessage', e.target.value)}
              placeholder="Enter welcome message"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="footerText">Footer Text</Label>
            <Input
              id="footerText"
              value={config.footerText}
              onChange={(e) => updateConfig('footerText', e.target.value)}
              placeholder="Enter footer text"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Logo & Images */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Logo & Images</h3>
          <p className="text-sm text-muted-foreground">
            Upload company logo and favicon
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="p-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                <h4 className="font-medium">Company Logo</h4>
              </div>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                {config.companyLogo ? (
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-primary rounded-lg mx-auto flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-xl">S</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Logo uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No logo uploaded</p>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleFileUpload('companyLogo')}
                className="w-full"
              >
                Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground">
                Recommended: 200x200px, PNG or SVG
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                <h4 className="font-medium">Favicon</h4>
              </div>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                {config.favicon ? (
                  <div className="space-y-2">
                    <div className="w-8 h-8 bg-primary rounded mx-auto flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">S</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Favicon uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No favicon uploaded</p>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleFileUpload('favicon')}
                className="w-full"
              >
                Upload Favicon
              </Button>
              <p className="text-xs text-muted-foreground">
                Recommended: 32x32px, ICO or PNG
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Color Scheme */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Color Scheme</h3>
          <p className="text-sm text-muted-foreground">
            Customize the platform's color palette
          </p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={config.primaryColor}
                onChange={(e) => updateConfig('primaryColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={config.primaryColor}
                onChange={(e) => updateConfig('primaryColor', e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={config.secondaryColor}
                onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={config.secondaryColor}
                onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                placeholder="#64748b"
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex gap-2">
              <Input
                id="accentColor"
                type="color"
                value={config.accentColor}
                onChange={(e) => updateConfig('accentColor', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={config.accentColor}
                onChange={(e) => updateConfig('accentColor', e.target.value)}
                placeholder="#8b5cf6"
                className="flex-1"
              />
            </div>
          </div>
        </div>
        
        {/* Color Preview */}
        <Card className="p-4">
          <CardContent className="p-0">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Color Preview</h4>
              <div className="flex gap-4">
                <div className="space-y-1">
                  <div 
                    className="w-16 h-16 rounded-lg border"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  <p className="text-xs text-center">Primary</p>
                </div>
                <div className="space-y-1">
                  <div 
                    className="w-16 h-16 rounded-lg border"
                    style={{ backgroundColor: config.secondaryColor }}
                  />
                  <p className="text-xs text-center">Secondary</p>
                </div>
                <div className="space-y-1">
                  <div 
                    className="w-16 h-16 rounded-lg border"
                    style={{ backgroundColor: config.accentColor }}
                  />
                  <p className="text-xs text-center">Accent</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Typography */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Typography</h3>
          <p className="text-sm text-muted-foreground">
            Choose the font family for the platform
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="fontFamily">Font Family</Label>
          <select
            id="fontFamily"
            value={config.fontFamily}
            onChange={(e) => updateConfig('fontFamily', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fontOptions.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>
        
        {/* Font Preview */}
        <Card className="p-4">
          <CardContent className="p-0">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Font Preview</h4>
              <div style={{ fontFamily: config.fontFamily }}>
                <h3 className="text-lg font-semibold">Sample Heading</h3>
                <p className="text-sm text-muted-foreground">
                  This is how your text will appear with the selected font family.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Custom CSS */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Custom CSS</h3>
          <p className="text-sm text-muted-foreground">
            Add custom CSS for advanced styling
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="customCSS">Custom CSS Code</Label>
          <Textarea
            id="customCSS"
            value={config.customCSS}
            onChange={(e) => updateConfig('customCSS', e.target.value)}
            placeholder="/* Add your custom CSS here */"
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Use with caution. Invalid CSS may affect platform functionality.
          </p>
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
            Saving Branding Settings...
          </>
        ) : (
          <>
            <Palette className="h-4 w-4 mr-2" />
            Save Branding Settings
          </>
        )}
      </Button>
    </div>
  );
}