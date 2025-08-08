import { User } from "../models/user.model.js";

// todo: later we can show the users only their friends not all users
export const getAllUsers = async (req, res, next) => {
    try {
        const currentUserId = req.auth.userId;
        const users = await User.find({ clerkId: {$ne: currentUserId }});
        res.status(200).json(users);
    } catch (error) {
        console.log("Error in getAllUsers", error);
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        
    } catch (error) {
        console.log("Error in getMessages", error);
        next(error);
    }
};