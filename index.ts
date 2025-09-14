import express from "express";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import URL from "./src/models/url.model";
import connectDB from "./src/lib/db";
import authRoutes from "./src/routes/auth.route"; 
import customAuthRoutes from "./src/routes/auth.local.route"
import { requireAuth } from "./src/middlewares/auth.guard";

dotenv.config();
const app = express();
app.use(express.json());
connectDB();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  return res.send("server is running successfully!");
});

app.set("trust proxy", true);

// ✅ Auth.js routes (should be at /auth/*)

app.use("/auth", authRoutes);
app.use("/api", customAuthRoutes);

// ✅ Protected route (uses Auth.js session)
app.get("/profile", requireAuth, (req, res) => {
  res.json({ message: "This is a protected profile route" });
});

// ✅ Short URL creation route
app.post("/shorturl", async (req, res) => {
  try {
    const { redirectUrl } = req.body;

    if (!redirectUrl) {
      return res.status(400).json({
        status: false,
        message: "Please provide a URL",
      });
    }

    const existingUrl = await URL.findOne({ redirectUrl });
    if (existingUrl) {
      return res.status(200).json({
        status: true,
        message: "Short URL already exists",
        shortUrl: existingUrl.shortUrl,
      });
    }

    const shortId = nanoid(6);
    const shortUrl = `http://localhost:${PORT}/${shortId}`;

    const newUrl = await URL.create({
      shortUrl,
      redirectUrl,
    });

    return res.status(201).json({
      status: true,
      message: "Short URL generated successfully",
      shortUrl: newUrl.shortUrl,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// ✅ Redirect handler
app.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;
    if (shortId) {
      const shortUrl = `http://localhost:${PORT}/${shortId}`;
      const existingShortUrl = await URL.findOne({ shortUrl });
      if (!existingShortUrl)
        return res
          .status(400)
          .json({ status: false, message: "Invalid short url" });

      return res.redirect(existingShortUrl.redirectUrl);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
