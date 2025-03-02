const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
const cors = require("cors");

app.use(
  cors({
    origin: "*", // Allow all origins (for testing)
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "x-auth-token"],
  })
);

// Setup mail transporter (Use your email credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mukeshprajapat3093@gmail.com", // Replace with your email
    pass: "enha vsyb wind mshw", // Use App Password if using Gmail
  },
});
// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://root:root@ipr.hanid.mongodb.net/?retryWrites=true&w=majority&appName=ipr",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  age: Number,
  gender: String,
  levels: [
    {
      chapter: String,
      levelNumber: Number,
      score: Number,
      timeTaken: Number,
      completedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);

// JWT Secret
const JWT_SECRET = "your-secret-key"; // Change this to a secure random string in production

// Register endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, age, gender } = req.body;
    console.log("Received registration request:", req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      levels: [],
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Protected route example
app.get("/api/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("User fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Get leaderboard - Fetch all users and sort by total score
app.get("/api/leaderboard", async (req, res) => {
  try {
    const users = await User.find().select("name email levels");

    // ✅ Calculate total score for each user
    const leaderboard = users.map((user) => ({
      name: user.name,
      email: user.email,
      totalScore: (user.levels || []).reduce(
        (sum, level) => sum + (level.score || 0),
        0
      ),
    }));

    // ✅ Sort by highest total score
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    res.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Password Reset Route
app.post("/api/reset-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate a password reset token (valid for 15 minutes)
    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });

    // Ensure the path is compatible with Expo Router format
    // Note: Using the correct port where your Expo Web app is running
    const resetLink = `http://localhost:8081/reset-password?token=${resetToken}`;

    console.log("Generated reset link:", resetLink); // Debug log

    const mailOptions = {
      from: "mukeshprajapat3093@gmail.com",
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link is valid for 15 minutes.</p>
        <p>If the link doesn't work, copy and paste this URL into your browser:</p>
        <p>${resetLink}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Verify Reset Token & Update Password
app.post("/api/update-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ message: "Invalid or expired token" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
