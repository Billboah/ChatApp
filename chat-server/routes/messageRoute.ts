import { Router } from 'express';
import {authenticate} from '../middleware/authMiddleware'
import {getChatMessages, sendMessage} from '../controllers/messageController'


const router: Router = Router();


router.post('/', authenticate, sendMessage) 

router.get('/:chatId', authenticate, getChatMessages)

export default router;