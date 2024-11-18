import { Router, Request, Response } from 'express';
import  {Chat, IChat } from '../models/chatModel'
import {authenticate} from '../middleware/authMiddleware'
import  {User, IUser } from '../models/userModels';
import {addMemberController, changeGroupIconController, changeGroupNameController, createChatController, createGroupChatController, getAllChatController, removeMemberController} from '../controllers/chatController'

const router: Router = Router();

  
router.post('/', authenticate, createChatController);

router.get('/', authenticate, getAllChatController);
            
router.post('/group', authenticate, createGroupChatController);
          
router.put('/rename', authenticate, changeGroupNameController);

router.put('/changeicon', authenticate, changeGroupIconController);

router.put('/groupremove', authenticate, removeMemberController);
        
//add member to group chat
router.put('/groupadd', authenticate, addMemberController);

export default router;
 