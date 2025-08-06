/**
 * export const getAdmin = (req, res) => {
    res.send("Admin Route with GET method in admin controller");
};
*/

export const createSong = async (req, res) => {
    try {
        if (!req.files || !req.files.audioFile || !req.files.imageFile) {
            return res.status(400).json({ message: "Please upload all files" });
        }
    } catch (error) {
        
    }
};