'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Menu,
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  MessageSquare,
  Building2,
  HelpCircle,
  Upload,
  Library,
  UserCheck,
  Shield,
  X,
  ChevronRight,
} from 'lucide-react';
import { Profile } from '@/lib/types/database';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  profile: Profile;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: string;
}

export function MobileNavigation({ profile }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const adminNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: Home,
    },
    {
      title: 'User Management',
      icon: Users,
      children: [
        {
          title: 'Pending Approvals',
          href: '/admin/users/pending',
          icon: UserCheck,
        },
        {
          title: 'All Users',
          href: '/admin/users',
          icon: Users,
        },
      ],
    },
    {
      title: 'Documents',
      href: '/admin/documents',
      icon: FileText,
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      title: 'Security',
      href: '/admin/security',
      icon: Shield,
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
      icon: FileText,
      children: [
        {
          title: 'Upload',
          href: '/employee/documents/upload',
          icon: Upload,
        },
        {
          title: 'My Library',
          href: '/employee/documents',
          icon: Library,
        },
      ],
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

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
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

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const itemIsActive = item.href ? isActive(item.href) : false;

    return (
      <div key={item.title}>
        {hasChildren ? (
          <Button
            variant='ghost'
            className={cn(
              'w-full justify-start gap-3 h-12 px-4',
              level > 0 && 'pl-8',
              'text-left'
            )}
            onClick={() => toggleExpanded(item.title)}
          >
            <item.icon className='h-5 w-5 shrink-0' />
            <span className='flex-1 text-left'>{item.title}</span>
            {item.badge && (
              <Badge variant='secondary' className='text-xs'>
                {item.badge}
              </Badge>
            )}
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          </Button>
        ) : (
          <Button
            variant='ghost'
            className={cn(
              'w-full justify-start gap-3 h-12 px-4',
              level > 0 && 'pl-8',
              itemIsActive && 'bg-accent text-accent-foreground'
            )}
            asChild
            onClick={() => setIsOpen(false)}
          >
            <Link href={item.href || '#'}>
              <item.icon className='h-5 w-5 shrink-0' />
              <span className='flex-1 text-left'>{item.title}</span>
              {item.badge && (
                <Badge variant='secondary' className='text-xs'>
                  {item.badge}
                </Badge>
              )}
            </Link>
          </Button>
        )}

        {hasChildren && isExpanded && (
          <div className='space-y-1'>
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' size='sm' className='md:hidden'>
          <Menu className='h-5 w-5' />
          <span className='sr-only'>Open navigation menu</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side='left' className='w-80 p-0'>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <SheetHeader className='p-6 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                  <span className='text-primary-foreground font-bold text-sm'>S</span>
                </div>
                <SheetTitle className='text-xl font-bold'>Stealth</SheetTitle>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsOpen(false)}
                className='h-8 w-8 p-0'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </SheetHeader>

          {/* User Info */}
          <div className='px-6 pb-4'>
            <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
              <Avatar className='h-10 w-10'>
                <AvatarFallback className='bg-primary text-primary-foreground'>
                  {getInitials(profile.full_name, profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='font-medium truncate'>
                  {profile.full_name || profile.email}
                </p>
                <p className='text-sm text-muted-foreground capitalize'>
                  {profile.role}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <nav className='flex-1 px-4 py-4 space-y-1 overflow-y-auto'>
            {navItems.map((item) => renderNavItem(item))}
          </nav>

          <Separator />

          {/* Footer Actions */}
          <div className='p-4 space-y-2'>
            <Button
              variant='ghost'
              className='w-full justify-start gap-3 h-10'
              asChild
              onClick={() => setIsOpen(false)}
            >
              <Link href='/profile'>
                <Settings className='h-4 w-4' />
                Profile Settings
              </Link>
            </Button>
            
            <Button
              variant='ghost'
              className='w-full justify-start gap-3 h-10'
              asChild
              onClick={() => setIsOpen(false)}
            >
              <Link href='/settings'>
                <Settings className='h-4 w-4' />
                App Settings
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}