import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

// DISABLED: This conflicts with email auth session management
export function getSession_DISABLED() {
  throw new Error("Replit session management disabled - use email auth");
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

// DISABLED: This was causing conflicts with email auth
async function upsertUser_DISABLED(
  claims: any,
) {
  // Disabled to prevent conflicts with email auth
  return;
}

// COMPLETELY DISABLED: This conflicts with email auth
export async function setupAuth_DISABLED(app: Express) {
  // All Replit OAuth functionality disabled
  return;

  // Disabled - using email auth instead
  // app.get("/api/login", (req, res, next) => {
  //   passport.authenticate(`replitauth:${req.hostname}`, {
  //     prompt: "login consent",
  //     scope: ["openid", "email", "profile", "offline_access"],
  //   })(req, res, next);
  // });

  // Disabled - using email auth instead
  // app.get("/api/callback", (req, res, next) => {
  //   passport.authenticate(`replitauth:${req.hostname}`, {
  //     successReturnToOrRedirect: "/",
  //     failureRedirect: "/api/login",
  //   })(req, res, next);
  // });

  // Disabled - using email auth instead
  // app.get("/api/logout", (req, res) => {
  //   req.logout(() => {
  //     res.redirect(
  //       client.buildEndSessionUrl(config, {
  //         client_id: process.env.REPL_ID!,
  //         post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
  //       }).href
  //     );
  //   });
  // });
}

// DISABLED: Use requireAuth from emailAuth.ts instead
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  return res.status(401).json({ message: "Replit auth disabled - use email auth" });
};
