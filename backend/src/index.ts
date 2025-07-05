import "dotenv/config";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import passport from "./config/passport"; // passport config
import authRoutes from "./routes/authRoutes"; // auth routes
import dashboardRoutes from "./routes/dashboardRoutes"; // dashboard routes
import cors from "cors";
import "./bot";
import discordServerRoutes from "./routes/discordServerRoutes";

const PORT = process.env.PORT || 6969;

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Allow requests from your frontend URL
    credentials: true, // Allow cookies to be sent
  })
);

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
app.use("/auth", authRoutes);
app.use("/dashboard", passport.authenticate("session"), dashboardRoutes);
app.use("/server", passport.authenticate("session"), discordServerRoutes);

// Basic route for testing
app.get("/", (_req, res) => {
  res.send("Backend API is running!");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
