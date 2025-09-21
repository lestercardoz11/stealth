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
import { User, LogOut, Shield, MessageSquare, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/utils/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import { Profile } from '@/lib/types/database';

interface TopNavigationProps {
  profile: Profile | null;
}

export function TopNavigation({ profile }: TopNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

  const getQuickActions = () => {
    if (!profile || profile.status !== 'approved') return [];

    if (profile.role === 'admin') {
      return [{ icon: Shield, label: 'Dashboard', href: '/admin' }];
    } else {
      return [
        { icon: MessageSquare, label: 'AI Chat', href: '/employee/chat' },
      ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <header className='h-16'>
      <div className='flex h-full items-center justify-between px-4'>
        {pathname === '/' && (
          <Link href='/' className='flex items-center space-x-3'>
            <div className='w-7 h-7 bg-primary rounded-lg flex items-center justify-center'>
              <span className='text-primary-foreground font-bold text-sm'>
                S
              </span>
            </div>
            <span className='font-bold text-lg'>Stealth</span>
          </Link>
        )}
        {/* Left side - could add breadcrumbs or search here */}
        <div className='flex items-center gap-3'>
          {/* Mobile spacing for menu button */}
          <div className='w-6 md:w-0' />

          {/* Breadcrumbs or page title could go here */}
          <div className='hidden md:block items-end'>
            {/* This could be dynamic based on current route */}
          </div>
        </div>

        <div className='flex items-center space-x-3'>
          {profile ? (
            <div className='flex items-center gap-3'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className='h-6 w-6 cursor-pointer'>
                    <AvatarFallback className='bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm'>
                      {getInitials(profile.full_name, profile.email)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-48 focus:outline-none'
                  align='end'
                  forceMount>
                  <DropdownMenuLabel className='font-normal focus:outline-none'>
                    <div className='flex flex-col space-y-0.5'>
                      <p className='text-xs font-medium leading-none'>
                        {profile.full_name || 'User'}
                      </p>
                      <p className='text-xs leading-none text-muted-foreground truncate'>
                        {profile.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  {pathname === '/' && quickActions.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      {quickActions.map((action) => (
                        <DropdownMenuItem
                          key={action.href}
                          className='cursor-pointer focus:outline-none'
                          asChild>
                          <Link href={action.href}>
                            <action.icon className='mr-2 h-4 w-4' />
                            <span>{action.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  <DropdownMenuItem className='cursor-pointer' asChild>
                    <Link href='/profile'>
                      <User className='mr-2 h-4 w-4' />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem className='cursor-pointer' asChild>
                    <Link href='/settings'>
                      <Settings className='mr-2 h-4 w-4' />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='cursor-pointer text-destructive'
                    onClick={handleSignOut}>
                    <LogOut className='mr-2 h-4 w-4 text-destructive' />
                    <span className=' text-destructive'>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className='hidden md:flex items-center space-x-4'>
              <Button
                variant='ghost'
                asChild
                className='text-foreground hover:text-foreground'>
                <Link href='/auth/login'>Sign In</Link>
              </Button>
              <Button asChild className='bg-primary hover:bg-primary/90'>
                <Link href='/auth/sign-up'>Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant='ghost'
            size='sm'
            className='md:hidden'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden py-4 border-t'>
            <div className='flex flex-col space-y-4'>
              {!profile && (
                <div className='flex flex-col space-y-2 pt-4 border-t'>
                  <Button variant='ghost' asChild className='justify-start'>
                    <Link href='/auth/login'>Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className='bg-primary hover:bg-primary/90 justify-start'>
                    <Link href='/auth/sign-up'>Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
