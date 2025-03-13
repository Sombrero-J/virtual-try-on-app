// import dotenv from 'dotenv';
// dotenv.config();

// import { handler } from '../../../build/handler.js';
// import express from 'express';
// import { createServer } from 'http';
// import { Server as SocketIOServer } from 'socket.io';

// const app = express();
// const httpServer = createServer(app);
// const io = new SocketIOServer(httpServer);

// app.use(handler);

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   socket.on('joinSession', (sessionId) => {
//     socket.join(sessionId);
//   });

//   socket.on('imageUploaded', ({ sessionId, imageUrl }) => {
//     io.to(sessionId).emit('newImage', imageUrl);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// const PORT = process.env.PORT || 5173;
// httpServer.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT} NOW`);
// });