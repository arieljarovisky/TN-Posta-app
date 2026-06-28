import passport from "passport";
import passportJWT from "passport-jwt";

import { TiendanubeAuthInterface } from "@features/auth";
import { userRepository } from "@repository";

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const resolveStoreId = (jwtPayload: Record<string, unknown>): number | null => {
  const rawStoreId =
    jwtPayload.storeId ?? jwtPayload.store_id ?? jwtPayload.user_id;

  const storeId = Number(rawStoreId);

  if (!storeId || Number.isNaN(storeId)) {
    return null;
  }

  return storeId;
};

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY || "THE_SECRET",
    },
    (jwtPayload, done) => {
      const storeId = resolveStoreId(jwtPayload as Record<string, unknown>);

      if (!storeId) {
        return done(null, false);
      }

      const storedCredentials = userRepository.findOptional(storeId);

      if (storedCredentials?.access_token) {
        return done(null, storedCredentials);
      }

      const sessionUser: TiendanubeAuthInterface = {
        user_id: storeId,
      };

      return done(null, sessionUser);
    }
  )
);
