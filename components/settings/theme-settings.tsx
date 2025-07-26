'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [message, setMessage] = useState<string | null>(null);

  const themes = [
    {
      value: 'light',
      label: 'Light',
      description: 'Clean and bright interface',
      icon: Sun,
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Easy on the eyes in low light',
      icon: Moon,
    },
    {
      value: 'system',
      label: 'System',
      description: 'Follows your system preference',
      icon: Monitor,
    },
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setMessage('Theme updated successfully!');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold'>Theme Preference</h3>
        <p className='text-sm text-muted-foreground'>
          Choose how Stealth looks and feels
        </p>
      </div>

      <RadioGroup value={theme} onValueChange={handleThemeChange}>
        <div className='grid gap-4'>
          {themes.map((themeOption) => (
            <div key={themeOption.value} className='relative'>
              <RadioGroupItem
                value={themeOption.value}
                id={themeOption.value}
                className='peer sr-only'
              />
              <Label
                htmlFor={themeOption.value}
                className='flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-accent peer-checked:border-primary peer-checked:bg-accent/50 transition-colors'>
                <div className='flex items-center justify-center w-10 h-10 rounded-full bg-muted'>
                  <themeOption.icon className='h-5 w-5' />
                </div>
                <div className='flex-1'>
                  <div className='font-medium'>{themeOption.label}</div>
                  <div className='text-sm text-muted-foreground'>
                    {themeOption.description}
                  </div>
                </div>
                {theme === themeOption.value && (
                  <Check className='h-5 w-5 text-primary' />
                )}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      {/* Theme Preview */}
      <div className='space-y-4'>
        <h4 className='text-sm font-medium'>Preview</h4>
        <Card className='p-4'>
          <CardContent className='p-0'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <div className='h-4 bg-foreground rounded w-24'></div>
                  <div className='h-3 bg-muted-foreground rounded w-32'></div>
                </div>
                <div className='h-8 w-8 bg-primary rounded'></div>
              </div>
              <div className='space-y-2'>
                <div className='h-3 bg-muted rounded w-full'></div>
                <div className='h-3 bg-muted rounded w-3/4'></div>
                <div className='h-3 bg-muted rounded w-1/2'></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      {message && (
        <Card className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'>
          <CardContent className='p-3'>
            <div className='flex items-center gap-2'>
              <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
              <p className='text-sm text-green-700 dark:text-green-300'>
                {message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Theme Options */}
      <div className='space-y-4'>
        <h4 className='text-sm font-medium'>Customization</h4>
        <div className='grid gap-4'>
          <div className='flex items-center justify-between'>
            <div>
              <Label className='text-sm font-medium'>High Contrast</Label>
              <p className='text-sm text-muted-foreground'>
                Increase contrast for better accessibility
              </p>
            </div>
            <Button variant='outline' size='sm' disabled>
              Coming Soon
            </Button>
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <Label className='text-sm font-medium'>Compact Mode</Label>
              <p className='text-sm text-muted-foreground'>
                Reduce spacing for more content density
              </p>
            </div>
            <Button variant='outline' size='sm' disabled>
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
