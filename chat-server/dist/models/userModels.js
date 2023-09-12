"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose = __importStar(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
const EmailValidator = __importStar(require("email-validator"));
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true,
        validate: {
            validator: EmailValidator.validate,
            message: (props) => `${props.value} is not valid email address!`,
        }, },
    password: { type: String, minLength: 8, required: true },
    confirmPassword: { type: String, required: true, minLength: 8, },
    pic: { type: String, default: "https://upload.wikimedia.org/wikipedia/commons/7/70/User_icon_BLACK-01.png" }
}, {
    timestamps: true
});
UserSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        var user = this;
        try {
            if (this.isModified('password')) {
                if (this.password !== this.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                const salt = yield bcrypt.genSalt(10);
                user.password = yield bcrypt.hash(user.password, salt);
                user.confirmPassword = undefined;
            }
            next();
        }
        catch (error) {
            return next(error);
        }
    });
});
UserSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield bcrypt.compare(candidatePassword, this.password);
        }
        catch (error) {
            throw new Error(error);
        }
    });
};
const User = mongoose.model('User', UserSchema);
exports.User = User;
