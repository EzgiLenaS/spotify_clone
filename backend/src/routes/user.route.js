import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getAllUsers, getMessages } from "../controller/user.controller.js";

const userRoutes = Router();

// ProtectRoute checks if the user authenticated or not
/* userRoutes.get("/like", protectRoute, (req, res) => {
    req.auth.userId;
    res.send("User Route with GET method");
}); */

// todo: later we can use getAllUsers only for the admin
// todo: listeners can chat only with their friends when they follow them
userRoutes.get("/", protectRoute, getAllUsers);
userRoutes.get("/", protectRoute, getMessages);

export default userRoutes;