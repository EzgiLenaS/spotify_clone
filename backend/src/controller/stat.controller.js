import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { User } from "../models/user.model.js";

export const statsOfEverything = async (req, res, next) => {
    try {
        /* const allSongs = await Song.countDocuments();
        const allAlbums = await Album.countDocuments();
        const allUsers = await User.countDocuments(); */

        /* const [ allSongs, allAlbums, allUsers, allUniqueArtists ] = await Promise.all([
            Song.countDocuments(),
            Album.countDocuments(),
            User.countDocuments(),

            Song.aggregate([

            ]),
        ]);
        res.status(200).json({
            allAlbums,
            allSongs,
            allUsers,
            allUniqueArtists
        }); */
    } catch (error) {
        console.log("Error in numberOfAllSongs", error);
        next(error);
    }
};