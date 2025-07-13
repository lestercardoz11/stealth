'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Settings,
  LogOut,
  Shield,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User as SuperbaseUser } from '@supabase/supabase-js';
import { Profile } from '@/lib/types/database';

interface StealthNavigationProps {
  user: SuperbaseUser | null;
  profile: Profile | null;
}

export function StealthNavigation({ user, profile }: StealthNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  const getStatusBadge = () => {
    if (!profile) return null;

    switch (profile.status) {
      case 'approved':
        return (
          <Badge variant='default' className='bg-green-500 text-xs ml-2'>
            Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant='secondary' className='text-xs ml-2'>
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant='destructive' className='text-xs ml-2'>
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getQuickActions = () => {
    if (!profile || profile.status !== 'approved') return [];

    if (profile.role === 'admin') {
      return [
        { icon: Shield, label: 'Admin Dashboard', href: '/admin' },
        { icon: Users, label: 'User Management', href: '/admin/users' },
        { icon: FileText, label: 'Documents', href: '/admin/documents' },
        { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
      ];
    } else {
      return [
        { icon: MessageSquare, label: 'AI Chat', href: '/app/chat' },
        { icon: FileText, label: 'My Documents', href: '/app/documents' },
        {
          icon: FileText,
          label: 'Company Docs',
          href: '/app/company-documents',
        },
      ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <nav className='relative z-50 bg-black/80 backdrop-blur-md border-b border-gray-800'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-3'>
            <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>S</span>
            </div>
            <span className='text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
              Stealth
            </span>
          </Link>

          {/* User Menu or Auth Buttons */}
          <div className='flex items-center space-x-4'>
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='relative h-10 w-auto px-3 text-white hover:bg-gray-800'>
                    <div className='flex items-center space-x-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarFallback className='bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm'>
                          {getInitials(profile.full_name, profile.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='hidden md:flex flex-col items-start'>
                        <span className='text-sm font-medium'>
                          {profile.full_name || profile.email}
                        </span>
                        <div className='flex items-center'>
                          <span className='text-xs text-gray-400 capitalize'>
                            {profile.role}
                          </span>
                          {getStatusBadge()}
                        </div>
                      </div>
                      <ChevronDown className='h-4 w-4 text-gray-400' />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-64 bg-gray-900 border-gray-700'
                  align='end'
                  forceMount>
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-sm font-medium leading-none text-white'>
                        {profile.full_name || 'User'}
                      </p>
                      <p className='text-xs leading-none text-gray-400'>
                        {profile.email}
                      </p>
                      <div className='flex items-center pt-1'>
                        <span className='text-xs text-gray-400 capitalize'>
                          {profile.role}
                        </span>
                        {getStatusBadge()}
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  {quickActions.length > 0 && (
                    <>
                      <DropdownMenuSeparator className='bg-gray-700' />
                      <DropdownMenuLabel className='text-xs text-gray-400 uppercase tracking-wider'>
                        Quick Actions
                      </DropdownMenuLabel>
                      {quickActions.map((action) => (
                        <DropdownMenuItem
                          key={action.href}
                          className='cursor-pointer text-gray-300 hover:text-white hover:bg-gray-800'
                          asChild>
                          <Link href={action.href}>
                            <action.icon className='mr-2 h-4 w-4' />
                            <span>{action.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}

                  <DropdownMenuSeparator className='bg-gray-700' />
                  <DropdownMenuItem className='cursor-pointer text-gray-300 hover:text-white hover:bg-gray-800'>
                    <User className='mr-2 h-4 w-4' />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className='cursor-pointer text-gray-300 hover:text-white hover:bg-gray-800'>
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className='bg-gray-700' />
                  <DropdownMenuItem
                    className='cursor-pointer text-red-400 hover:text-red-300 hover:bg-gray-800'
                    onClick={handleSignOut}>
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className='hidden md:flex items-center space-x-4'>
                <Button
                  variant='ghost'
                  asChild
                  className='text-white hover:bg-gray-800'>
                  <Link href='/auth/login'>Sign In</Link>
                </Button>
                <Button
                  asChild
                  className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'>
                  <Link href='/auth/sign-up'>Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant='ghost'
              size='sm'
              className='md:hidden text-white'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <X className='h-5 w-5' />
              ) : (
                <Menu className='h-5 w-5' />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden py-4 border-t border-gray-800'>
            <div className='flex flex-col space-y-4'>
              {!user && (
                <div className='flex flex-col space-y-2 pt-4 border-t border-gray-800'>
                  <Button
                    variant='ghost'
                    asChild
                    className='text-white hover:bg-gray-800 justify-start'>
                    <Link href='/auth/login'>Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 justify-start'>
                    <Link href='/auth/sign-up'>Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
