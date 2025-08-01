'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Profile } from '@/lib/types/database';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
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
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  profile: Profile;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: string;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
          // badge: '3', // This would be dynamic
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
      icon: FileText,
      href: '/admin/documents',
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
    {
      title: 'Security',
      href: '/admin/security',
      icon: Shield,
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

  const NavItemComponent = ({
    item,
    level = 0,
  }: {
    item: NavItem;
    level?: number;
  }) => {
    const [isOpen, setIsOpen] = useState(
      item.children?.some((child) => child.href && isActive(child.href)) ||
        false
    );

    if (item.children) {
      return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant='ghost'
              className={cn(
                'w-full justify-start gap-3 h-10 px-3',
                level > 0 && 'pl-6',
                isCollapsed && 'px-2 justify-center'
              )}>
              <item.icon className='h-4 w-4 shrink-0' />
              {!isCollapsed && (
                <>
                  <span className='flex-1 text-left'>{item.title}</span>
                  {item.badge && (
                    <span className='bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full'>
                      {item.badge}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronDown className='h-4 w-4' />
                  ) : (
                    <ChevronRight className='h-4 w-4' />
                  )}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          {!isCollapsed && (
            <CollapsibleContent className='space-y-1'>
              {item.children.map((child) => (
                <NavItemComponent
                  key={child.title}
                  item={child}
                  level={level + 1}
                />
              ))}
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    return (
      <Button
        variant='ghost'
        className={cn(
          'w-full justify-start gap-3 h-10 px-3',
          level > 0 && 'pl-6',
          isCollapsed && 'px-2 justify-center',
          item.href && isActive(item.href) && 'bg-accent text-accent-foreground'
        )}
        asChild>
        <Link href={item.href || '#'}>
          <item.icon className='h-4 w-4 shrink-0' />
          {!isCollapsed && (
            <>
              <span className='flex-1 text-left'>{item.title}</span>
              {item.badge && (
                <span className='bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full'>
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Link>
      </Button>
    );
  };

  const sidebarContent = (
    <div className='flex flex-col h-full'>
      {/* Logo */}
      <Link href='/'>
        <div
          className={cn(
            'h-16 flex items-center gap-3 py-2 px-6 border-b',
            isCollapsed && 'justify-center px-3'
          )}>
          <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
            <span className='text-primary-foreground font-bold text-sm'>S</span>
          </div>
          {!isCollapsed && <span className='font-bold text-xl'>Stealth</span>}
        </div>
      </Link>

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
        {navItems.map((item) => (
          <NavItemComponent key={item.title} item={item} />
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className='p-4 border-t'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn('w-full', isCollapsed && 'px-2 justify-center')}>
          {isCollapsed ? (
            <ChevronRight className='h-4 w-4' />
          ) : (
            <>
              <ChevronRight className='h-4 w-4 rotate-180' />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 md:hidden'
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-card border-r transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64'
        )}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-card border-r transition-all duration-300 ease-in-out md:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
        {sidebarContent}
      </aside>
    </>
  );
}
