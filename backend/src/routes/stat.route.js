import { Router } from "express";

const statRoutes = Router();

statRoutes.get("/", (req, res) => {
    res.send("Statistics Route with GET method");
});

export default statRoutes;