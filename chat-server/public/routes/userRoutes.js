"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/allRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.post('/signup', userController_1.signupController);
router.post('/signin', userController_1.signInController);
router.get('/', authMiddleware_1.authenticate, userController_1.searchUsersController);
router.put('/rename', authMiddleware_1.authenticate, userController_1.changeUserName);
//update profile icon
router.put('/updatepic', authMiddleware_1.authenticate, userController_1.changePicController);
router.put('/updateselectedchat', authMiddleware_1.authenticate, userController_1.updateSelectedChat);
exports.default = router;
