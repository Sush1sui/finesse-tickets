import "dotenv/config";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import passport from "./config/passport"; // Your passport config
import authRoutes from "./routes/authRoutes"; // Your auth routes
import "./bot";

const PORT = process.env.PORT || 6969; // Changed default to 3000 for backend API

const app = express();

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI!,
      collectionName: "sessions", // Optional: specify session collection name
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes); // Prefix auth routes with /api

// Basic route for testing
app.get("/", (_req, res) => {
  res.send("Backend API is running!");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
