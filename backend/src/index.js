import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// ROUTES
/* app.get("/", (req, res) => {
    res.send("hello world");
});
*/

// Middleware for getting the value from req.body
app.use(express.json()); // to parse req.body

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
// Admin can create songs and albums
app.use("/api/admin", adminRoutes);
// Fetching songs
app.use("/api/songs", songRoutes);
// Albums
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

app.listen(PORT, () => 
{
    console.log("server started on port " + PORT);
    connectDB();
});