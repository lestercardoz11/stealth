'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Lock, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface PasswordChangeProps {
  onPasswordChange: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  userEmail: string;
}

export function PasswordChange({
  onPasswordChange,
}: Omit<PasswordChangeProps, 'userEmail'>) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long',
      });
      setIsLoading(false);
      return;
    }

    try {
      await onPasswordChange(formData.currentPassword, formData.newPassword);

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Failed to update password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak' };
    if (password.length < 8) return { strength: 2, label: 'Fair' };
    if (
      password.length >= 8 &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    ) {
      return { strength: 4, label: 'Strong' };
    }
    return { strength: 3, label: 'Good' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='grid gap-4'>
        {/* Current Password */}
        <div className='grid gap-2'>
          <Label htmlFor='currentPassword'>Current Password</Label>
          <div className='relative'>
            <Input
              id='currentPassword'
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              placeholder='Enter your current password'
              required
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
              onClick={() => togglePasswordVisibility('current')}>
              {showPasswords.current ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </Button>
          </div>
        </div>

        {/* New Password */}
        <div className='grid gap-2'>
          <Label htmlFor='newPassword'>New Password</Label>
          <div className='relative'>
            <Input
              id='newPassword'
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              placeholder='Enter your new password'
              required
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
              onClick={() => togglePasswordVisibility('new')}>
              {showPasswords.new ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </Button>
          </div>

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <div className='flex-1 bg-muted rounded-full h-2'>
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      passwordStrength.strength === 1 && 'w-1/4 bg-red-500',
                      passwordStrength.strength === 2 && 'w-2/4 bg-orange-500',
                      passwordStrength.strength === 3 && 'w-3/4 bg-yellow-500',
                      passwordStrength.strength === 4 && 'w-full bg-green-500'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    passwordStrength.strength === 1 && 'text-red-600',
                    passwordStrength.strength === 2 && 'text-orange-600',
                    passwordStrength.strength === 3 && 'text-yellow-600',
                    passwordStrength.strength === 4 && 'text-green-600'
                  )}>
                  {passwordStrength.label}
                </span>
              </div>
              <p className='text-xs text-muted-foreground'>
                Use at least 8 characters with a mix of letters, numbers, and
                symbols
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className='grid gap-2'>
          <Label htmlFor='confirmPassword'>Confirm New Password</Label>
          <div className='relative'>
            <Input
              id='confirmPassword'
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder='Confirm your new password'
              required
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
              onClick={() => togglePasswordVisibility('confirm')}>
              {showPasswords.confirm ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </Button>
          </div>
          {formData.confirmPassword &&
            formData.newPassword !== formData.confirmPassword && (
              <p className='text-xs text-red-600'>Passwords do not match</p>
            )}
        </div>
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

      {/* Submit Button */}
      <Button type='submit' disabled={isLoading} className='w-full sm:w-auto'>
        {isLoading ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin mr-2' />
            Updating...
          </>
        ) : (
          <>
            <Lock className='h-4 w-4 mr-2' />
            Update Password
          </>
        )}
      </Button>
    </form>
  );
}
