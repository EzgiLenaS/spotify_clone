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
    try {
        const currentUser = await clerkClient.users.getUser(req.auth.userId);
        // Question mark: ? helps us to check the "primaryEmailAddress" array
        const isAdmin = process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress?.emailAddress;

        if (!isAdmin) {
            // Admin unauthorization - 403 Forbidden
            res.status(403).json({ message: "Forbidden. You must be an admin" });
           
            return;
        }

        next();
    } catch (error) {
        console.log("Internal server error", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};