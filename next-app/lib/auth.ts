import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { encryptText } from "@/lib/encryption";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId: string;
    } & DefaultSession["user"];
  }

  interface User {
    discordId: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[next-auth signIn callback] Starting", {
        userId: user?.id,
        // avoid `any` to satisfy eslint: narrow profile to expected shape for logging
        profileId: (profile as { id?: string })?.id,
        hasAccessToken: !!account?.access_token,
      });

      await dbConnect();

      try {
        const discordProfile = profile as {
          id: string;
          username: string;
          avatar?: string;
        };

        // Store encrypted OAuth tokens in your Mongoose User collection
        let dbUser = await User.findOne({ discordId: discordProfile.id });

        if (dbUser) {
          // Update existing user
          dbUser.username = discordProfile.username;
          dbUser.avatar = discordProfile.avatar
            ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
            : undefined;

          // Encrypt and store tokens
          if (account?.access_token) {
            dbUser.accessToken = encryptText(account.access_token);
          }
          if (account?.refresh_token) {
            dbUser.refreshToken = encryptText(account.refresh_token);
          }

          await dbUser.save();
          console.log("[next-auth signIn] Updated existing mongoose user");
        } else {
          // Create new user in your Mongoose collection
          dbUser = await User.create({
            discordId: discordProfile.id,
            username: discordProfile.username,
            avatar: discordProfile.avatar
              ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
              : undefined,
            accessToken: account?.access_token
              ? encryptText(account.access_token)
              : undefined,
            refreshToken: account?.refresh_token
              ? encryptText(account.refresh_token)
              : undefined,
          });
          console.log("[next-auth signIn] Created new mongoose user");
        }

        // Attach user ID and discordId for JWT callback
        user.id = (dbUser._id as mongoose.Types.ObjectId).toString();
        user.discordId = discordProfile.id;

        console.log("[next-auth signIn callback] Success");
        return true;
      } catch (error) {
        console.error("[next-auth signIn callback] Error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      // Persist user id and discordId to JWT token
      if (user) {
        token.id = user.id;
        token.discordId = user.discordId;
        console.log("[next-auth jwt] user -> token", {
          id: user.id,
          discordId: user.discordId,
        });
      }
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client from JWT token
      if (session.user) {
        session.user.id = token.id as string;
        session.user.discordId = token.discordId as string;
        console.log("[next-auth session callback] Final session:", {
          id: session.user.id,
          discordId: session.user.discordId,
          name: session.user.name,
        });
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
