import { Router, Request, Response } from 'express';
import  {Chat, IChat } from '../models/chatModel'
import {authenticate} from '../middleware/authMiddleware'
import  {User, IUser } from '../models/userModels';
import {Message, IMessage} from '../models/messageModel';
import {getChatMessages, sendMessageController} from '../controllers/messageController'


const router: Router = Router();


router.post('/', authenticate, sendMessageController) 

router.get('/:chatId', authenticate, getChatMessages)

export default router;