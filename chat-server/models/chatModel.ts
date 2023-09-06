import mongoose from 'mongoose'
import { IUser } from './userModels';
import { IMessage } from './messageModel';

interface IChat extends mongoose.Document {
              chatName: string;
              isGroupChat: boolean;
              users: IUser['_id'][];
              latestMessage: mongoose.Types.ObjectId;
              unreadMessages: IMessage[]
              groupAdmin: mongoose.Types.ObjectId;
}
 
const chatModel = new  mongoose.Schema({
              chatName: {type: String, trim: true},
              isGroupChat: {type: Boolean, default: false},
              pic: {
                            type: String,  default: "https://www.transparentpng.com/thumb/user/black-username-png-icon-free--4jlZLb.png",
},
              users: [{
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "User",
              },],
              latestMessage: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Message",
              },
              unreadMessages: 
                 [{
                  type: mongoose.Schema.Types.ObjectId, 
                  ref: "Message", 
                  default: [],
                }, ],
              groupAdmin: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "User",
              }
},
{
              timestamps: true
}
)

chatModel.pre('save', async function(next) {
  var chat = this;
  
  if(!chat.isGroupChat){
    chat.pic = undefined;
  }
  next()

  
});


const Chat = mongoose.model<IChat>("Chat", chatModel);

export {Chat, IChat}