import { Router } from "express";
// import { getAdmin } from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { createSong } from "../controller/admin.controller.js";

const adminRoutes = Router();

/** adminRoutes.get("/", getAdmin );
 * (req, res) => {
    res.send("User Route with GET method");
});
*/

// Upload and image and audio file from Cloudinary
adminRoutes.post("/songs", protectRoute, requireAdmin, createSong);


export default adminRoutes;