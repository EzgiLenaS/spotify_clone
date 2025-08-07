import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

const userRoutes = Router();

// ProtectRoute checks if the user authenticated or not
userRoutes.get("/like", protectRoute, (req, res) => {
    req.auth.userId;
    res.send("User Route with GET method");
});

export default userRoutes;