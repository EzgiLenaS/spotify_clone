import { Router } from "express";

const albumRoutes = Router();

albumRoutes.get("/", (req, res) => {
    res.send("Album Route with GET method");
});

export default albumRoutes;