"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const chatController_1 = require("../controllers/chatController");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authenticate, chatController_1.createChatController);
router.get('/', authMiddleware_1.authenticate, chatController_1.getAllChatController);
router.post('/group', authMiddleware_1.authenticate, chatController_1.createGroupChatController);
router.put('/rename', authMiddleware_1.authenticate, chatController_1.changeGroupNameController);
router.put('/changeicon', authMiddleware_1.authenticate, chatController_1.changeGroupIconController);
router.put('/groupremove', authMiddleware_1.authenticate, chatController_1.removeMemberController);
//add member to group chat
router.put('/groupadd', authMiddleware_1.authenticate, chatController_1.addMemberController);
exports.default = router;
