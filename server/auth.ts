import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, loginSchema, registerSchema } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      location?: string;
      role?: string;
      isActive?: boolean;
      lastLoginAt?: Date;
      createdAt?: Date;
      updatedAt?: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session configuration
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({ 
    pool, 
    createTableIfMissing: true,
    tableName: 'session',
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'hotelcast-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false, // Always false for development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
      domain: undefined, // Let browser handle domain
    },
    name: 'hotelcast.sid',
    rolling: true, // Extend session on activity
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password || !user.isActive) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Update last login
          await storage.updateUserLastLogin(user.id);
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user || !user.isActive) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      // Create user
      const hashedPassword = await hashPassword(validatedData.password);
      const userData = {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        location: validatedData.location,
        role: validatedData.role || 'user',
      };

      const user = await storage.createUser(userData);

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password from response
        const { password, ...userResponse } = user;
        res.status(201).json(userResponse);
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
    }

    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login failed" });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Login session error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        
        // Remove password from response
        const { password, ...userResponse } = user;
        res.json(userResponse);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('hotelcast.sid');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Remove password from response
    const { password, ...userResponse } = req.user;
    res.json(userResponse);
  });
}

// Middleware to check if user is authenticated
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user && req.user.isActive) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}