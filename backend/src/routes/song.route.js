import { Router } from "express";

const songRoutes = Router();

songRoutes.get("/", (req, res) => {
    res.send("Songs Route with GET method");
});

export default songRoutes;