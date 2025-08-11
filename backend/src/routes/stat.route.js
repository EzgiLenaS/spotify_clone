import { Router } from "express";
import { statsOfEverything } from "../controller/stat.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
const statRoutes = Router();

/* statRoutes.get("/", (req, res) => {
    res.send("Statistics Route with GET method");
}); */

statRoutes.get("/", protectRoute, requireAdmin, statsOfEverything);

export default statRoutes;