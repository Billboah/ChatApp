"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/allRoutes.ts
const express_1 = require("express");
const userModels_1 = require("../models/userModels");
const generateToken_1 = __importDefault(require("../config/generateToken"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
//Signup router
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, username, email, password, pic, confirmPassword } = req.body;
    try {
        if (!name || !email || !password || !username || !confirmPassword) {
            res.status(400);
            throw new Error('Please fill all the marked feilds');
        }
        const userExists = yield userModels_1.User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            res.status(400);
            throw new Error("User already exists");
        }
        const user = yield userModels_1.User.create({
            name, email, username, password, pic, confirmPassword
        });
        if (user) {
            res.status(201).json({
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                pic: user.pic,
                token: (0, generateToken_1.default)(user._id),
            });
        }
        else {
            res.status(400);
            throw new Error('Failed to create the User');
        }
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
//Signin router
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password } = req.body;
    try {
        if (!password || !name) {
            res.status(400);
            throw new Error('Please enter all the feilds');
        }
        const user = yield userModels_1.User.findOne({ $or: [{ username: name }, { email: name },] });
        if (user && (yield user.comparePassword(password))) {
            res.status(201).json({
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                pic: user.pic,
                token: (0, generateToken_1.default)(user._id),
            });
        }
        else {
            res.status(400);
            throw new Error('Invalid user name or email or password ');
        }
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
//get user/users
router.get('/', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keyword = req.query.search;
    try {
        const users = yield userModels_1.User.find(keyword ? {
            $or: [
                { username: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } }
            ]
        } : {}).find({ _id: { $ne: req.user._id } });
        res.json(users);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
//change username
router.put('/rename', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.body.username;
        const userId = req.user._id;
        const updatedUser = yield userModels_1.User.findByIdAndUpdate(userId, {
            username,
        }, {
            new: true,
        });
        if (!updatedUser) {
            res.status(400);
            throw new Error('User Not Found');
        }
        res.status(201).json({
            id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            pic: updatedUser.pic,
            token: (0, generateToken_1.default)(updatedUser._id),
        });
    }
    catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}));
//update profile icon
router.put('/updatepic', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pic = req.body.pic;
        const userId = req.user._id;
        const updatedUser = yield userModels_1.User.findByIdAndUpdate(userId, {
            pic,
        }, {
            new: true,
        });
        if (!updatedUser) {
            res.status(400);
            throw new Error('User Not Found');
        }
        res.status(201).json({
            id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            pic: updatedUser.pic,
            token: (0, generateToken_1.default)(updatedUser._id),
        });
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
exports.default = router;
