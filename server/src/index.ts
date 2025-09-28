import "dotenv/config";
import express from "express";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cors from "cors";
import rateLimit from "express-rate-limit";

import "./config/passport/passport"; // register passport strategy
import "./config/db/database"; // connect to database

import authRouter from "./routes/auth.route";
import dashboardRouter from "./routes/dashboard.route";

const app = express();

// security headers
app.use(helmet());
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year in seconds
    preload: true,
  })
);

// CORS - restrict to frontend origin (allow credentials)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rate limiters
const authLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/auth", authLimiter); // apply to auth routes only

// protect bot presence endpoint (server -> bot) as well
const internalLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/dashboard", internalLimiter);

// session store (persistent)
app.use(
  session({
    name: process.env.SESSION_NAME || "connect.sid",
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 24 * 21, // session TTL in 3 weeks
      autoRemove: "native", // let MongoDB expire documents
    }),
    cookie: {
      maxAge: 60 * 60 * 24 * 21 * 1000, // 3 weeks
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
    },
  })
);

// initialize passport after session
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);

app.get("/", (_req, res) => res.json({ message: "Do it with Finesse!" }));

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});
