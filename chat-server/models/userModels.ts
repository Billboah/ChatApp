import * as mongoose from 'mongoose'
import * as bcrypt from 'bcryptjs'
import * as EmailValidator from "email-validator";
import { IMessage } from './messageModel';

interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  pic: string;
  _id: string;

  unreadMessages: mongoose.Schema.Types.ObjectId[]

  password: string;
  selectedChat: mongoose.Schema.Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: {
    type: String, required: true, unique: true, lowercase: true,
    validate: {
      validator: EmailValidator.validate,
      message: (props) => `${props.value} is not valid email address!`,
    },
  },
  selectedChat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },


  unreadMessages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: [],
    },
  ],

  password: { type: String, minLength: 8, required: true },
  confirmPassword: { type: String, required: true, minLength: 8, },
  pic: { type: String, default: "https://upload.wikimedia.org/wikipedia/commons/7/70/User_icon_BLACK-01.png" }
}, {
  timestamps: true
})


UserSchema.pre('save', async function (next) {
  var user = this;

  try {
    if (this.isModified('password')) {
      if (this.password !== this.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      user.confirmPassword = undefined;
    }
    next();

  } catch (error) {
    return next(error);
  }


});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

const User = mongoose.model<IUser>('User', UserSchema)


export { User, IUser }

