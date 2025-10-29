import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  getChatMessages,
  getUnreadMessages,
} from "../controllers/messageController";

const router: Router = Router();

router.get("/:chatId", authenticate, getChatMessages);

router.get("unreadmessage/:chatId", authenticate, getUnreadMessages);

export default router; 
