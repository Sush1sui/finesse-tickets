declare module "passport-discord-auth" {
  import { Strategy as PassportStrategy } from "passport";

  export interface Profile {
    id: string;
    username: string;
    discriminator?: string;
    avatar?: string | null;
    email?: string | null;
  }

  export interface StrategyOptions {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    scope?: string[];
    passReqToCallback?: boolean;
  }

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user?: any) => void
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
  }

  export enum Scope {
    Identify = "identify",
    Email = "email",
    Guilds = "guilds",
  }
}
