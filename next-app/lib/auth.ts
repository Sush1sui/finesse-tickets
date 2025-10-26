import NextAuth, { DefaultSession } from "next-auth";
import Discord from "next-auth/providers/discord";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { encryptText } from "@/lib/encryption";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Discord({
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
      console.log("[next-auth signIn] profile, account available:", {
        profile: profile
          ? { id: (profile as any).id, username: (profile as any).username }
          : null,
        hasAccessToken: !!account?.access_token,
        hasRefreshToken: !!account?.refresh_token,
      });

      await dbConnect();

      try {
        const discordProfile = profile as {
          id: string;
          username: string;
          avatar?: string;
        };

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
        } else {
          // Create new user
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
        }

        // Attach MongoDB _id to user object for session callback
        user.id = (dbUser._id as mongoose.Types.ObjectId).toString();
        user.discordId = discordProfile.id;

        console.log("[next-auth signIn] persisted user id:", user.id);

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      // Persist the OAuth access_token and user id to the token right after signin
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
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string;
        session.user.discordId = token.discordId as string;
        console.log("[next-auth session] session prepared for client", {
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
    // Use database sessions so session state is stored server-side (session id cookie)
    strategy: "database",
  },
});
