import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongoose";
import { User } from "./models/User";
import type { UserRole } from "@/types/next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Auth: Missing email or password");
          throw new Error("Email and password required");
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        if (password.length > 128) {
          console.error("Auth: Password too long");
          throw new Error("Invalid credentials");
        }

        await connectToDatabase();

        const user = await User.findOne({ email });
        if (!user) {
          console.error("Auth: User not found for", email);
          throw new Error("Invalid credentials");
        }

        if (!user.isActive) {
          console.error("Auth: User deactivated", email);
          throw new Error("Account has been deactivated");
        }

        const isValid = await bcrypt.compare(
          password,
          user.passwordHash
        );
        if (!isValid) {
          console.error("Auth: Wrong password for", email);
          throw new Error("Invalid credentials");
        }

        console.log("Auth: Login success for", email);
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        const email = typeof profile?.email === "string" ? profile.email.toLowerCase().trim() : "";
        const name = typeof profile?.name === "string" ? profile.name : "Google User";
        const avatar = typeof profile?.image === "string" ? profile.image : "";
        const existingUser = await User.findOne({ email });
        if (!existingUser && email) {
          await User.create({
            name,
            email,
            passwordHash: "",
            role: "customer",
            avatar,
            isActive: true,
          });
        }
        if (existingUser && !existingUser.isActive) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role as UserRole;
        token.id = user.id;
      }
      if (account?.provider === "google") {
        await connectToDatabase();
        const email = typeof token.email === "string" ? token.email.toLowerCase().trim() : "";
        const dbUser = await User.findOne({ email });
        if (dbUser) {
          token.role = dbUser.role as UserRole;
          token.id = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role ?? "customer") as UserRole;
        session.user.id = token.id ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
