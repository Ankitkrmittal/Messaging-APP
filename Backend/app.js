import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import NodemailerHelper from 'nodemailer-otp';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from "cors"
const app = express();
const server = createServer(app);
const helper = new NodemailerHelper(process.env.EMAIL_USER, process.env.EMAIL_PASS);
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
  },
});
const PORT = 4444;

app.use(cors({
    origin: process.env.CORS_ORIGIN
}));
import chatHandler from "./socket/handlers/chat.handers.js"
import {socketAuth} from "./socket/middleware/socket.auth.js"
import authRoutes from "./http/routes/route.auth.js"
import requireAuth from './http/middlewares/requireAuth.js';
import userRoutes from "./http/routes/users.routes.js"
import friendRoutes from "./http/routes/friend.routes.js"


app.use('/api/auth',authRoutes)
app.use('/api/user',requireAuth,userRoutes)
app.use('/api/friend',requireAuth,friendRoutes)
io.use(socketAuth)
io.on('connection', (socket) => {
  socket.join(`user:${socket.user.id}`);
  console.log('a user connected',socket.id);
  chatHandler(socket,io);
});
server.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`)
})
