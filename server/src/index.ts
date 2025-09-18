import "dotenv/config";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";

import "./config/passport/passport"; // register passport strategy
import "./config/db/database"; // connect to database

import authRouter from "./routes/auth.route";
import cors from "cors";

// CORS setup
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

// session using MongoDB instead of MemoryStore
app.use(
  session({
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
    },
  })
);

// initialize passport after session
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/auth", authRouter);

app.get("/", (_req, res) => res.json({ message: "Do it with Finesse!" }));

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});
