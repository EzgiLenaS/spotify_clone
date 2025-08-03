import { Router } from "express";
import { authCallback } from "../controller/auth.controller.js";

const authRoutes = Router();

/*
This is only for the first time when somebody
is new in our app. User creation and adding
in to the database with signup
*/
authRoutes.post("/callback", authCallback );

export default authRoutes;