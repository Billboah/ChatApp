"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const messageController_1 = require("../controllers/messageController");
const router = (0, express_1.Router)();
router.get("/:chatId", authMiddleware_1.authenticate, messageController_1.getChatMessages);
router.get("unreadmessage/:chatId", authMiddleware_1.authenticate, messageController_1.getUnreadMessages);
exports.default = router;
