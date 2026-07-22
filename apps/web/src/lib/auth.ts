import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { Role } from "@/generated/prisma";

// Extend the built-in types
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    employmentType: string;
    organizationId: string;
    isActive: boolean;
    forcePasswordChange: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      employmentType: string;
      organizationId: string;
      isActive: boolean;
      forcePasswordChange: boolean;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { organization: true },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // SECURITY CHECKS
        // 1. Check if user is active
        if (!user.isActive) {
          return null; // Account is deactivated
        }

        // 2. Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null; // Account is temporarily locked
        }

        // 3. Verify password with bcrypt
        const password = credentials.password as string;
        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          // Increment failed login attempts
          const failedAttempts = (user.failedLoginAttempts || 0) + 1;
          const shouldLock = failedAttempts >= 5; // Lock after 5 failed attempts
          
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: failedAttempts,
              lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : undefined, // Lock for 30 minutes
            },
          });
          
          return null;
        }

        // 4. Reset failed login attempts on successful login
        if (user.failedLoginAttempts > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
            },
          });
        }

        // 5. Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            lastActiveAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          employmentType: user.employmentType,
          organizationId: user.organizationId,
          isActive: user.isActive,
          forcePasswordChange: user.forcePasswordChange,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.employmentType = user.employmentType;
        token.organizationId = user.organizationId;
        token.isActive = user.isActive;
        token.forcePasswordChange = user.forcePasswordChange;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.employmentType = token.employmentType as string;
        session.user.organizationId = token.organizationId as string;
        session.user.isActive = token.isActive as boolean;
        session.user.forcePasswordChange = token.forcePasswordChange as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
