// routes/allRoutes.ts
import { Router} from 'express';
import {authenticate} from '../middleware/authMiddleware'
import {changePicController, changeUserName, searchUsersController, signInController, signupController, updateSelectedChat} from '../controllers/userController'

const router: Router = Router();



router.post('/signup', signupController)
            

router.post('/signin', signInController)


router.get('/', authenticate, searchUsersController)            


router.put('/rename', authenticate, changeUserName); 

//update profile icon
router.put('/updatepic', authenticate, changePicController);

router.put('/updateselectedchat', authenticate, updateSelectedChat);

export default router;

