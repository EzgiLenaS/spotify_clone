import { Router } from "express";
import { statsOfEverything } from "../controller/stat.controller.js";

const statRoutes = Router();

/* statRoutes.get("/", (req, res) => {
    res.send("Statistics Route with GET method");
}); */

statRoutes.get("/", protectRoute, requireAdmin, statsOfEverything);

export default statRoutes;