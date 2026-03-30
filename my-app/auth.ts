import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github"; 
import Google from "next-auth/providers/google"; 
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { compare } from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // --- SOCIAL PROVIDERS ---
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        await connectDB();
        
        const user = await User.findOne({ email: credentials?.email });

        if (!user) {
          throw new Error("User not found.");
        }

        if (user.password) {
            const isPasswordValid = await compare(credentials?.password as string, user.password);
            if (!isPasswordValid) throw new Error("Invalid password.");
        }

        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    //  Handle Social Login Creation in DB
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          await connectDB();
          
          // Check if user exists
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user if they don't exist
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "user", // Default role
              // No password needed for OAuth users
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving user to DB", error);
          return false;
        }
      }
      return true; 
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub; 
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login", 
  },
});