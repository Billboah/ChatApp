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
exports.Chat = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chatModel = new mongoose_1.default.Schema({
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    pic: {
        type: String,
    },
    users: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
        },],
    latestMessage: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Message",
    },
    groupAdmin: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    }
}, {
    timestamps: true
});
chatModel.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        var chat = this;
        if (!chat.isGroupChat) {
            chat.pic = undefined;
        }
        next();
    });
});
const Chat = mongoose_1.default.models.Chat || mongoose_1.default.model('Chat', chatModel);
exports.Chat = Chat;
