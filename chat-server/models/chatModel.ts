import mongoose from 'mongoose'

interface IChat extends mongoose.Document {
  chatName: string;
  isGroupChat: boolean;
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  latestMessage: mongoose.Types.ObjectId;
  groupAdmin: mongoose.Types.ObjectId;
}

const chatModel = new mongoose.Schema({
  chatName: { type: String, trim: true },
  isGroupChat: { type: Boolean, default: false },
  pic: {
    type: String,
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
},
  {
    timestamps: true
  }
)

chatModel.pre('save', async function (next) {
  var chat = this;

  if (!chat.isGroupChat) {
    chat.pic = undefined;
  }
  next()


});


 const Chat = mongoose.models.Chat || mongoose.model('Chat', chatModel);

export { Chat, IChat }