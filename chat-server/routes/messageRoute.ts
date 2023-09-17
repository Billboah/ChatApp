import { Router, Request, Response } from 'express';
import  {Chat, IChat } from '../models/chatModel'
import {authenticate} from '../middleware/authMiddleware'
import  {User, IUser } from '../models/userModels';
import {Message, IMessage} from '../models/messageModel';


const router: Router = Router();

//send a message
router.post('/', authenticate, async (req: Request, res: Response) => {
              const {content, chatId}:{content: string, chatId: string} = req.body

              if (!content || !chatId){
                            console.log('Invalid data passed into request')
                            return res.sendStatus(400)
              }

              try{
                            const newMessage = await Message.create({
                                          sender: req.user._id,
                                          content: content,
                                          chat: chatId,
                                          delivered: true,
                                        });
                                    
                                        const message = await Message.findById(newMessage._id)
                                        .populate('sender', 'username pic email')
                                        .populate('chat')
                                        .populate({
                                          path: 'chat.users',
                                          select: 'username pic email',
                                        });

                            await  Chat.findByIdAndUpdate(req.body.chatId, {
                                          latestMessage: message, 
                            })

                            await Chat.findByIdAndUpdate(
                              req.body.chatId,
                              {
                                $push: { unreadMessages:  message }, 
                              },
                              { new: true } 
                            )

                            res.json(message)
              }catch(error){
                res.status(error.status || 500).json({ error: error.message });
              }
}) 

//get chat message
router.get('/:chatId', authenticate, async (req: Request, res: Response) => {

              try{
                            const message = await Message.find({chat: req.params.chatId})
                            .populate("sender", "username pic email")
                            .populate("chat")
                            
                            await Chat.findByIdAndUpdate(
                              req.params.chatId,
                              {
                                $set: { unreadMessages: [] },
                              },
                              { new: true } 
                            );

                            res.json(message)
              }catch(error){
                res.status(error.status || 500).json({ error: error.message });
              }
})

export default router;