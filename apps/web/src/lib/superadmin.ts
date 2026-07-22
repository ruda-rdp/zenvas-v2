/**
 * Super Admin utilities
 * 
 * Super admin is determined by:
 * 1. User's email must match SUPERADMIN_EMAIL env variable
 * 2. User must be OWNER of their organization
 */

import { Session } from "next-auth";

/**
 * Check if a user is a super admin
 * Super admin can manage ALL organizations, brands, and users
 */
export function isSuperAdmin(session: Session | null): boolean {
  if (!session?.user?.email) {
    return false;
  }
  
  const superAdminEmail = process.env.SUPERADMIN_EMAIL;
  if (!superAdminEmail) {
    return false;
  }
  
  return session.user.email.toLowerCase() === superAdminEmail.toLowerCase();
}

/**
 * Require super admin - throws error if not authorized
 */
export function requireSuperAdmin(session: Session | null): void {
  if (!isSuperAdmin(session)) {
    throw new Error("Unauthorized: Super admin access required");
  }
}
