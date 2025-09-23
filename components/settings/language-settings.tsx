'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Globe, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface LanguageSettings {
  language: string;
  region: string;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
}

export function LanguageSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [settings, setSettings] = useState<LanguageSettings>({
    language: 'en',
    region: 'US',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    timezone: 'America/New_York',
  });

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
  ];

  const regions = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
  ];

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Seoul', label: 'Korea Standard Time (KST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would save to your backend/database
      localStorage.setItem('languageSettings', JSON.stringify(settings));

      setMessage({
        type: 'success',
        text: 'Language and region settings saved successfully!',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save language settings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof LanguageSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const formatPreview = () => {
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: settings.timeFormat === '12',
    };

    const locale = `${settings.language}-${settings.region}`;
    const formattedDate = now.toLocaleDateString(locale, dateOptions);
    const formattedTime = now.toLocaleTimeString(locale, timeOptions);

    return { date: formattedDate, time: formattedTime };
  };

  const preview = formatPreview();

  return (
    <div className='space-y-6'>
      {/* Language Selection */}
      <div className='space-y-4'>
        <div>
          <h3 className='text-lg font-semibold'>Language</h3>
          <p className='text-sm text-muted-foreground'>
            Choose your preferred language for the interface
          </p>
        </div>

        <Select
          value={settings.language}
          onValueChange={(value) => updateSetting('language', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className='flex items-center gap-2'>
                  <span>{lang.name}</span>
                  <span className='text-muted-foreground'>
                    ({lang.nativeName})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Region Selection */}
      <div className='space-y-4'>
        <div>
          <h3 className='text-lg font-semibold'>Region</h3>
          <p className='text-sm text-muted-foreground'>
            Select your region for localized content and formats
          </p>
        </div>

        <Select
          value={settings.region}
          onValueChange={(value) => updateSetting('region', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.code} value={region.code}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Format */}
      <div className='space-y-4'>
        <div>
          <h3 className='text-lg font-semibold'>Date Format</h3>
          <p className='text-sm text-muted-foreground'>
            Choose how dates are displayed
          </p>
        </div>

        <RadioGroup
          value={settings.dateFormat}
          onValueChange={(value) => updateSetting('dateFormat', value)}>
          <div className='space-y-2'>
            {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map((format) => (
              <div key={format} className='flex items-center space-x-2'>
                <RadioGroupItem value={format} id={format} />
                <Label htmlFor={format} className='flex-1 cursor-pointer'>
                  {format}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Time Format */}
      <div className='space-y-4'>
        <div>
          <h3 className='text-lg font-semibold'>Time Format</h3>
          <p className='text-sm text-muted-foreground'>
            Choose between 12-hour and 24-hour time format
          </p>
        </div>

        <RadioGroup
          value={settings.timeFormat}
          onValueChange={(value) => updateSetting('timeFormat', value)}>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='12' id='12hour' />
              <Label htmlFor='12hour' className='flex-1 cursor-pointer'>
                12-hour (2:30 PM)
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='24' id='24hour' />
              <Label htmlFor='24hour' className='flex-1 cursor-pointer'>
                24-hour (14:30)
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Timezone */}
      <div className='space-y-4'>
        <div>
          <h3 className='text-lg font-semibold'>Timezone</h3>
          <p className='text-sm text-muted-foreground'>
            Set your local timezone for accurate timestamps
          </p>
        </div>

        <Select
          value={settings.timezone}
          onValueChange={(value) => updateSetting('timezone', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Preview */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Preview</h3>
        <Card className='p-4'>
          <CardContent className='p-0'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>Date:</span>
                <span className='text-sm font-medium'>{preview.date}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>Time:</span>
                <span className='text-sm font-medium'>{preview.time}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>Language:</span>
                <span className='text-sm font-medium'>
                  {languages.find((l) => l.code === settings.language)?.name}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>Region:</span>
                <span className='text-sm font-medium'>
                  {regions.find((r) => r.code === settings.region)?.name}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Message */}
      {message && (
        <Card
          className={cn(
            'border',
            message.type === 'success'
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          )}>
          <CardContent className='p-3'>
            <div className='flex items-center gap-2'>
              {message.type === 'success' ? (
                <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
              ) : (
                <AlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
              )}
              <p
                className={cn(
                  'text-sm',
                  message.type === 'success'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                )}>
                {message.text}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isLoading}
        className='w-full sm:w-auto'>
        {isLoading ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin mr-2' />
            Saving...
          </>
        ) : (
          <>
            <Globe className='h-4 w-4 mr-2' />
            Save Language Settings
          </>
        )}
      </Button>
    </div>
  );
}
