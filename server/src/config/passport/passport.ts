import passport from "passport";
import { Strategy, Profile, Scope } from "passport-discord-auth";
import User from "../../model/User";
import { encryptText } from "../../utils/encryption";

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
  new (Strategy as any)(
    {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      callbackUrl: process.env.DISCORD_CALLBACK_URL!,
      scope: [Scope.Identify, Scope.Email, Scope.Guilds],
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
          user.username = profile.username;
          user.avatar = profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : undefined;

          // update tokens so server can make API calls on behalf of user
          // encrypt tokens before saving
          if (accessToken) user.accessToken = encryptText(accessToken);
          if (refreshToken) user.refreshToken = encryptText(refreshToken);

          await user.save();
          return done(null, user);
        }

        const newUser = new User({
          discordId: profile.id,
          username: profile.username,
          avatar: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : undefined,
          // store encrypted tokens
          accessToken: accessToken ? encryptText(accessToken) : undefined,
          refreshToken: refreshToken ? encryptText(refreshToken) : undefined,
        });
        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
