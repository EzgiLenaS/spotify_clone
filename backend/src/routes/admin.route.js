import { Router } from "express";
import { getAdmin } from "../controller/admin.controller.js";

const adminRoutes = Router();

adminRoutes.get("/", getAdmin );
    
    
/*(req, res) => {
    res.send("User Route with GET method");
});
*/

export default adminRoutes;