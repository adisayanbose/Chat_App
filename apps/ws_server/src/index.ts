import { WebSocket, WebSocketServer } from "ws";
import jwt, { decode, JwtPayload } from "jsonwebtoken";
import { prismaclient } from "@repo/database/client";
import dotenv, { parse } from "dotenv";

const wss = new WebSocketServer({
  port: 8080,
});

interface user {
  userId: String;
  rooms: string[];
  ws: WebSocket;
}
function validateuser(token: string | null) {
  if (token) {
    if (process.env.JWT_SECRET) {
      try {
        const decodeddata = jwt.verify(token!, process.env.JWT_SECRET);
        return (decodeddata as JwtPayload).userId;
      } catch (e) {
        console.log(e);
        return ""
      }
    }
  } else {
    return "";
  }
}
dotenv.config({ path: "../../.env" });

const users: user[] = [];
wss.on("connection", (ws, req) => {
  const searchaparaams = new URLSearchParams(req.url?.split("/")[1]);
  const token = searchaparaams.get("token");
  const userId = validateuser(token);
  if (!userId) {
    console.log("unauthorized access");
    ws.send("unauthorized access");
    ws.close();
    return;
  }
  users.push({
    userId: userId,
    rooms: [],
    ws: ws,
  });
  ws.on("message", async (data) => {
    const parseddata = JSON.parse(data.toString());
    if (parseddata.type == "JOIN_ROOM") {
      const roomavailable = await prismaclient.room.findFirst({
        where: {
          roomId: parseddata.roomId,
        },
      });
      if (!roomavailable) {
        ws.send("room not available");
        return;
      }
      const user = users.find((user) => user.userId == userId);
      const rooms = user!.rooms;
      if (!rooms.includes(parseddata.roomId)) {
        rooms.push(parseddata.roomId);
      }
      ws.send("room JOINED");
     }

    if (parseddata.type == "LEAVE_ROOM") {
      const roomavailable = await prismaclient.room.findFirst({
        where: {
          roomId: parseddata.roomId,
        },
      });
      if (!roomavailable) {
        ws.send("already left the room");
        return;
      }
      const rooms = users.find((user) => user.userId == userId)!.rooms;
      if (!rooms.includes(parseddata.roomId)) {
        ws.send("room not yet subscribed");
        return;
      }
      const newrooms = rooms.filter((x) => x != parseddata.roomId);
      users.find((user) => user.userId == userId)!.rooms = newrooms;
      ws.send("room left");
    }

    if (parseddata.type == "CHAT") {
      const roomavailable = await prismaclient.room.findFirst({
        where: {
          roomId: parseddata.roomId,
        },
      });
      if (!roomavailable) {
        ws.send("already left the room");
        return;
      }
      const roomId = parseddata.roomId;
      const chat=prismaclient.chat.create({
        data:{
            roomId:parseddata.data.roomId,
            userId:userId,
            message:parseddata.messaage
        }
      })
      
      const sameroomusers = users.filter((user) => user.rooms.includes(roomId));
      sameroomusers.forEach((user) => {
        user.ws.send(parseddata.message);
      });
    }
  });
});
