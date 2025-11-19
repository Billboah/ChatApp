import { Router} from 'express';
import {authenticate} from '../middleware/authMiddleware'
import {changePicController, changeUserName, searchUsersController, signInController, signupController} from '../controllers/userController'

const router: Router = Router();



router.post('/signup', signupController)

router.post('/signin', signInController)

router.get('/', authenticate, searchUsersController)            

router.put('/rename', authenticate, changeUserName); 

router.put('/updatepic', authenticate, changePicController);

export default router;

