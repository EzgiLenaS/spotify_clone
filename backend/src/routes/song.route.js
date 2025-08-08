import { Router } from "express";

import { getAllSongs, getFeaturedSongs } from "../controller/song.controller.js";
import { getMadeForYouSongs } from "../controller/song.controller.js";
import { getTrendingSongs } from "../controller/song.controller.js";

import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const songRoutes = Router();

/* songRoutes.get("/", (req, res) => {
    res.send("Songs Route with GET method");
}); */

songRoutes.get("/", protectRoute, requireAdmin, getAllSongs);
songRoutes.get("/featured", getFeaturedSongs);
songRoutes.get("/made-for-you", getMadeForYouSongs);
songRoutes.get("/trending", getTrendingSongs);

export default songRoutes;