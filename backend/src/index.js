import express from "express";
import dotenv from "dotenv";

const app = express();
const PORT = process.env.PORT;

dotenv.config();

app.listen(PORT, () => 
{
    console.log("server started on port 5001");
});