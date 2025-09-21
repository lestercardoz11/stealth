'use client';

import * as React from 'react';
import {
  Building2,
  Command,
  FileText,
  HelpCircle,
  Home,
  MessageSquare,
  Users,
  Settings,
  Shield,
  BarChart3,
  Upload,
  Library,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Profile } from '@/lib/types/database';
import { NavUser } from '../nav-user';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  profile: Profile;
}

export function AppSidebar({ profile }: SidebarProps) {
  const pathname = usePathname();

  const adminNavItems = [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: Home,
    },
    {
      title: 'User Management',
      url: '/admin/users',
      icon: Users,
    },
    {
      title: 'Documents',
      url: '/admin/documents',
      icon: FileText,
    },
    {
      title: 'Analytics',
      url: '/admin/analytics',
      icon: BarChart3,
    },
    {
      title: 'Security',
      url: '/admin/security',
      icon: Shield,
    },
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: Settings,
    },
  ];

  const employeeNavItems = [
    {
      title: 'AI Chat',
      url: '/employee/chat',
      icon: MessageSquare,
    },
    {
      title: 'My Documents',
      url: '/employee/documents',
      icon: Library,
    },
    {
      title: 'Upload Documents',
      url: '/employee/documents/upload',
      icon: Upload,
    },
    {
      title: 'Company Documents',
      url: '/employee/company-documents',
      icon: Building2,
    },
    {
      title: 'Help',
      url: '/employee/help',
      icon: HelpCircle,
    },
  ];

  const navItems = profile.role === 'admin' ? adminNavItems : employeeNavItems;

  const isActive = (url: string) => {
    if (url === '/admin' || url === '/employee') {
      return pathname === url;
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="overflow-hidden">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={profile.role === 'admin' ? '/admin' : '/employee/chat'}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Stealth AI</span>
                  <span className="truncate text-xs capitalize">{profile.role}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser profile={profile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}