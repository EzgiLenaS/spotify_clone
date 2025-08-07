import { Router } from "express";
import { getAlbumById, getAllAlbums } from "../controller/album.controller.js";

const albumRoutes = Router();

/* albumRoutes.get("/", (req, res) => {
    res.send("Album Route with GET method");
}); */

// If you want only the accounters listen music,  you can add protectRoute function
albumRoutes.get("/", getAllAlbums);
albumRoutes.get("/:id", getAlbumById);

export default albumRoutes;