import { Router, Request, Response } from 'express';
import User from '../models/userModels'
import generateToken from '../config/generateToken'
import {authenticate} from '../middleware/authMiddleware'

const router: Router = Router();

router.post('/', authenticate, async (req:Request, res: Response) => {
              
})

export default router;
