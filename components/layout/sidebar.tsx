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
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Profile } from '@/lib/types/database';
import { NavUser } from '../nav-user';
import Link from 'next/link';

const adminNavItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Home,
    isActive: false,
  },
  {
    title: 'Users',
    icon: Users,
    url: '/admin/users',
    isActive: false,
  },
  {
    title: 'Documents',
    icon: FileText,
    url: '/admin/documents',
    isActive: false,
  },
  // {
  //   title: 'Settings',
  //   url: '/admin/settings',
  //   icon: Settings,
  //   isActive: false,
  // },
  // {
  //   title: 'Security',
  //   url: '/admin/security',
  //   icon: Shield,
  //   isActive: false,
  // },
];

const employeeNavItems = [
  {
    title: 'AI Chat',
    url: '/employee/chat',
    icon: MessageSquare,
    isActive: false,
  },
  {
    title: 'My Documents',
    icon: FileText,
    url: '/employee/documents',
    isActive: false,
  },
  {
    title: 'Company Documents',
    url: '/employee/company-documents',
    icon: Building2,
    isActive: false,
  },
  {
    title: 'Help',
    url: '/employee/help',
    icon: HelpCircle,
    isActive: false,
  },
];

interface SidebarProps {
  profile: Profile;
}

export function AppSidebar({ profile }: SidebarProps) {
  const navMain = profile.role === 'admin' ? adminNavItems : employeeNavItems;
  const [activeItem, setActiveItem] = React.useState(navMain[0]);
  const { setOpen } = useSidebar();

  return (
    <Sidebar collapsible='none' className='overflow-hidden h-screen border-r'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild className='md:h-8 md:p-0'>
              <a href='#'>
                <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                  <Command className='size-4' />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className='px-1.5 md:px-0'>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={{
                      children: item.title,
                      hidden: false,
                    }}
                    onClick={() => {
                      setActiveItem(item);
                      setOpen(true);
                    }}
                    isActive={activeItem?.title === item.title}
                    className='px-2 h-8 w-8'
                    asChild>
                    <Link href={item.url || '#'}>
                      <item.icon />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='p-0'>
        <NavUser profile={profile} />
      </SidebarFooter>
    </Sidebar>
  );
}
