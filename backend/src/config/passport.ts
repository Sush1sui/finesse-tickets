import passport from "passport";
import { Strategy as DiscordStrategy, Profile } from "passport-discord";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      callbackURL: process.env.DISCORD_CALLBACK_URL!,
      scope: ["identify", "email", "guilds"], // Adjust scopes as needed
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        let user = await User.findOne({ discordId: profile.id });

        if (user) {
          // Update user if necessary (e.g., avatar, username, tokens)
          user.username = profile.username;
          user.avatar = profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : undefined;
          user.accessToken = accessToken;
          user.refreshToken = refreshToken;
          await user.save();
          return done(null, user);
        } else {
          // Create new user
          const newUser = new User({
            discordId: profile.id,
            username: profile.username,
            avatar: profile.avatar
              ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
              : undefined,
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
          await newUser.save();
          return done(null, newUser);
        }
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

export default passport;
