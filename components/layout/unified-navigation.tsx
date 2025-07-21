'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Profile } from '@/lib/types/database';
import { cn } from '@/lib/utils';
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
import {
  User,
  Settings,
  LogOut,
  Shield,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  Menu,
  X,
  Bell,
  Home,
  Upload,
  Library,
  UserCheck,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface UnifiedNavigationProps {
  profile: Profile;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: string;
}

export function UnifiedNavigation({ profile }: UnifiedNavigationProps) {
  const pathname = usePathname();
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

  const adminNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: Home,
    },
    {
      title: 'User Management',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'Pending Approvals',
      href: '/admin/users/pending',
      icon: UserCheck,
    },
    {
      title: 'Documents',
      href: '/admin/documents',
      icon: FileText,
    },
    {
      title: 'Upload Documents',
      href: '/admin/documents/upload',
      icon: Upload,
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  const employeeNavItems: NavItem[] = [
    {
      title: 'AI Chat',
      href: '/employee/chat',
      icon: MessageSquare,
    },
    {
      title: 'My Documents',
      href: '/employee/documents',
      icon: Library,
    },
    {
      title: 'Upload Documents',
      href: '/employee/documents/upload',
      icon: Upload,
    },
    {
      title: 'Company Documents',
      href: '/employee/company-documents',
      icon: Building2,
    },
    {
      title: 'Help',
      href: '/employee/help',
      icon: HelpCircle,
    },
  ];

  const navItems = profile.role === 'admin' ? adminNavItems : employeeNavItems;

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/employee') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getQuickActions = () => {
    if (profile.role === 'admin') {
      return [
        { icon: Shield, label: 'Admin Dashboard', href: '/admin' },
        { icon: Users, label: 'User Management', href: '/admin/users' },
        { icon: FileText, label: 'Documents', href: '/admin/documents' },
        { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
      ];
    } else {
      return [
        { icon: MessageSquare, label: 'AI Chat', href: '/employee/chat' },
        { icon: FileText, label: 'My Documents', href: '/employee/documents' },
        {
          icon: Building2,
          label: 'Company Docs',
          href: '/employee/company-documents',
        },
      ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <nav className='sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo and Brand */}
          <Link href='/' className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
              <span className='text-white font-bold text-lg'>S</span>
            </div>
            <div className='hidden sm:block'>
              <span className='text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                Stealth
              </span>
              <div className='text-xs text-gray-500 dark:text-gray-400 -mt-1'>
                {profile.role === 'admin' ? 'Admin Portal' : 'Employee Portal'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-1'>
            {navItems.slice(0, 5).map((item) => (
              <Button
                key={item.title}
                variant={isActive(item.href || '') ? 'default' : 'ghost'}
                size='sm'
                asChild
                className={cn(
                  'text-sm font-medium transition-all duration-200',
                  isActive(item.href || '')
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Link href={item.href || '#'} className='flex items-center gap-2'>
                  <item.icon className='h-4 w-4' />
                  <span className='hidden lg:inline'>{item.title}</span>
                </Link>
              </Button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className='flex items-center space-x-3'>
            {/* Notifications */}
            <Button variant='ghost' size='sm' className='relative hidden sm:flex'>
              <Bell className='h-4 w-4 text-gray-600 dark:text-gray-300' />
              <span className='absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center'>
                <span className='w-1.5 h-1.5 bg-white rounded-full'></span>
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-10 w-auto px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-8 w-8 ring-2 ring-blue-100 dark:ring-blue-900'>
                      <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold'>
                        {getInitials(profile.full_name, profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='hidden sm:block text-left'>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        {profile.full_name || 'User'}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {profile.role === 'admin' ? 'Administrator' : 'Employee'}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl'
                align='end'
                forceMount>
                <DropdownMenuLabel className='font-normal p-4'>
                  <div className='flex flex-col space-y-2'>
                    <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                      {profile.full_name || 'User'}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {profile.email}
                    </p>
                    <div className='flex items-center gap-2'>
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        profile.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                      )} />
                      <span className='text-xs text-gray-500 dark:text-gray-400 capitalize'>
                        {profile.status}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                {quickActions.length > 0 && (
                  <>
                    <DropdownMenuSeparator className='bg-gray-200 dark:bg-gray-700' />
                    <DropdownMenuLabel className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2'>
                      Quick Actions
                    </DropdownMenuLabel>
                    {quickActions.map((action) => (
                      <DropdownMenuItem
                        key={action.href}
                        className='cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mx-2'
                        asChild>
                        <Link href={action.href} className='flex items-center'>
                          <action.icon className='mr-3 h-4 w-4 text-gray-500 dark:text-gray-400' />
                          <span className='text-sm text-gray-700 dark:text-gray-300'>{action.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator className='bg-gray-200 dark:bg-gray-700' />
                <DropdownMenuItem className='cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mx-2'>
                  <User className='mr-3 h-4 w-4 text-gray-500 dark:text-gray-400' />
                  <span className='text-sm text-gray-700 dark:text-gray-300'>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mx-2'>
                  <Settings className='mr-3 h-4 w-4 text-gray-500 dark:text-gray-400' />
                  <span className='text-sm text-gray-700 dark:text-gray-300'>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className='bg-gray-200 dark:bg-gray-700' />
                <DropdownMenuItem
                  className='cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mx-2 px-4 py-2'
                  onClick={handleSignOut}>
                  <LogOut className='mr-3 h-4 w-4' />
                  <span className='text-sm font-medium'>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'>
            <div className='flex flex-col space-y-2'>
              {navItems.map((item) => (
                <Button
                  key={item.title}
                  variant={isActive(item.href || '') ? 'default' : 'ghost'}
                  className={cn(
                    'justify-start text-left',
                    isActive(item.href || '')
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300'
                  )}
                  asChild>
                  <Link href={item.href || '#'} className='flex items-center gap-3'>
                    <item.icon className='h-4 w-4' />
                    <span>{item.title}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}