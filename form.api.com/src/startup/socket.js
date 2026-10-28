// startup/socket.js

import http from "http";
import { Server as socketIO } from "socket.io";

const initializeSocket = (app) => {
  const server = http.createServer(app);
  const io = new socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  console.log("════════════════════════════════════════════════════════════");
  console.log("Socket.IO initialized");

  app.locals.io = io; // 👈 Attach socket instance to app

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);
    //* Connection
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);
    });
    //* Status
    socket.on("sendStatus", (data) => {
      console.log(
        "════════════════════════════════════════════════════════════"
      );
      if (data.orderId) {
        io.emit(`statusUpdated${data.orderId}`, {
          from: socket.id,
          ...data,
        });
      }
    });
    //* Driver Location
    socket.on("sendDriverLocation", (data) => {
      if (data.driverId) {
        io.emit(`onDriverLocationUpdate${data.driverId}`, {
          from: socket.id,
          ...data,
        });
      }
    });
    //* NearBy Driver
    socket.on("sendRequest", (data) => {
      if (data.driverId) {
        io.emit(`driverFounded${data.driverId}`, {
          from: socket.id,
          ...data,
        });
      }
    });
    //* Order Request
    socket.on("orderRequest", (data) => {
      console.log("orderRequest", data);

      if (data.vendor) {
        io.emit(`NewOrderReceived${data.vendor}`, {
          from: socket.id,
          ...data,
        });
      }
    });
    //* Disconnection
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
  console.log("════════════════════════════════════════════════════════════");
  return { server, io };
};

export default initializeSocket;
