import express from 'express';
import { getUserForSidebar } from '../controllers/messageController.js';
import { protectRoute } from '../middleware/auth.js';
import { getMessages, markMessagesAsSeen, sendMessage } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUserForSidebar);
messageRouter.get("/:Id", protectRoute, getMessages);
messageRouter.put("/mark/:Id", protectRoute, markMessagesAsSeen);
messageRouter.post("/send/:Id", protectRoute, sendMessage);

export default messageRouter;