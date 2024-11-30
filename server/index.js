import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessageRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";

dotenv.config();
// const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const databaseUrL = process.env.DATABASE_URL;

app.use(cors({
    origin: [process.env.ORIGIN],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
}));

app.use("/uploads/profiles", express.static("uploads/profiles"))
app.use("uploads/files", express.static("uploads/files"));

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/contacts',contactsRoutes);
app.use('/api/messages',messagesRoutes);
app.use('/api/channel',channelRoutes)

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

setupSocket(server);

mongoose
  .connect(databaseUrL)
  .then(() => console.log("DB connection established")).catch((err) => console.log(err.message));