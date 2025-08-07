import { Router } from "express";
// import { getAdmin } from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { createSong, deleteSong, createAlbum, deleteAlbum, checkAdmin } from "../controller/admin.controller.js";

const adminRoutes = Router();

/** adminRoutes.get("/", getAdmin );
 * (req, res) => {
    res.send("User Route with GET method");
});
*/
// adminRoutes.use(protectRoute, requireAdmin); is slightly optimized clean code

adminRoutes.get("/check", protectRoute, requireAdmin, checkAdmin);

// Upload and image and audio file from Cloudinary
adminRoutes.post("/songs", protectRoute, requireAdmin, createSong);
adminRoutes.delete("/songs/:id", protectRoute, requireAdmin, deleteSong);

adminRoutes.post("/albums", protectRoute, requireAdmin, createAlbum);
adminRoutes.delete("/albums/:id", protectRoute, requireAdmin, deleteAlbum);


export default adminRoutes;