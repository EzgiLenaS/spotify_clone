/**
 * This file will hels us to check the user
 * Whether they are admins or just the listeners
 * 
 * Also checks if the user is authenticated or not
 */

import { clerkClient } from "@clerk/express";

// Next function provides us to protect that route check user.route for example
export const protectRoute = async (req, res, next) => {
    if (!req.auth.userId) {
        // The code 401 is for unauthorization
        res.status(401).json({ message: "Unaouthorized - You must be logged in" });

        return;
    }

    next();
};

export const requireAdmin = async (req, res, next ) => {
    //if (!req.auth.userId)
};