"use server";

import { updateUserRole as updateRole, updateUserStatus as updateStatus } from "@/lib/auth/roles";
import { UserRole, UserStatus } from "@/lib/types/database";

export async function updateUserRole(userId: string, role: UserRole) {
  return await updateRole(userId, role);
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  return await updateStatus(userId, status);
}