"use client";

import { useState } from "react";
import { Profile, UserRole, UserStatus } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, UserX, Shield, User } from "lucide-react";
import { updateUserRole, updateUserStatus } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

interface UserManagementProps {
  users: Profile[];
}

export function UserManagement({ users }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleStatusUpdate = async (userId: string, newStatus: UserStatus) => {
    setIsUpdating(userId);
    try {
      await updateUserStatus(userId, newStatus);
      router.refresh();
    } catch (error) {
      console.error("Failed to update user status:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    setIsUpdating(userId);
    try {
      await updateUserRole(userId, newRole);
      router.refresh();
    } catch (error) {
      console.error("Failed to update user role:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="default">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        );
      case 'employee':
        return (
          <Badge variant="outline">
            <User className="mr-1 h-3 w-3" />
            Employee
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.full_name || user.email}</div>
                    {user.full_name && (
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(user.id, 'approved')}
                          disabled={isUpdating === user.id}
                        >
                          <UserCheck className="mr-1 h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(user.id, 'rejected')}
                          disabled={isUpdating === user.id}
                        >
                          <UserX className="mr-1 h-3 w-3" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {user.status === 'approved' && user.role === 'employee' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleUpdate(user.id, 'admin')}
                        disabled={isUpdating === user.id}
                      >
                        <Shield className="mr-1 h-3 w-3" />
                        Make Admin
                      </Button>
                    )}
                    
                    {user.role === 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleUpdate(user.id, 'employee')}
                        disabled={isUpdating === user.id}
                      >
                        <User className="mr-1 h-3 w-3" />
                        Remove Admin
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No users found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}