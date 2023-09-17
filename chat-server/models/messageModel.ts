import mongoose from 'mongoose'

interface IMessage extends mongoose.Document {
              sender: mongoose.Types.ObjectId;
              content: string;
              chat: mongoose.Types.ObjectId;
              delivered: boolean
}

const messageModel = new mongoose.Schema({
              sender: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
              content: {type: String, trim: true},
              chat: {type: mongoose.Schema.Types.ObjectId, ref: "Chat"},
              delivered: {type: Boolean}
}, {
              timestamps: true
})

const Message = mongoose.model<IMessage>("Message", messageModel )

export {Message, IMessage}