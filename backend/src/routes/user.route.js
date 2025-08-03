import { Router } from "express";

const userRoutes = Router();

userRoutes.get("/", (req, res) => {
    res.send("User Route with GET method");
});

export default userRoutes;