import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import type { Role } from "@/generated/prisma";

// Extend the built-in types
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    employmentType: string;
    organizationId: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      employmentType: string;
      organizationId: string;
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

        const password = credentials.password as string;
        if (!password) {
          return null;
        }

        // Verify password with bcrypt
        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          employmentType: user.employmentType,
          organizationId: user.organizationId,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.employmentType = token.employmentType as string;
        session.user.organizationId = token.organizationId as string;
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
