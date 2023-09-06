// routes/allRoutes.ts
import { Router, Request, Response } from 'express';
import {User} from '../models/userModels'
import asyncHandler from "express-async-handler"
import generateToken from '../config/generateToken'
import {authenticate} from '../middleware/authMiddleware'

const router: Router = Router();


//Signup router
router.post('/signup', asyncHandler(async (req: Request, res: Response)=>{
              const {name, username, email, password, pic, confirmPassword } = req.body
            
              if(!name || !email || !password || !username || !confirmPassword){
                            res.status(400);
                            throw new Error('Please fill all the marked feilds')
              }
            
              const userExists = await User.findOne({ $or: [ { username }, { email} ] })
            
              if (userExists){
                            throw new Error("User already exists")
              }
            
              const user = await User.create({
                            name, email, username, password, pic, confirmPassword
              })
            
              if (user){
                            res.status(201).json({
                                          id: user._id,
                                          name: user.name,
                                          username: user.username,
                                          email: user.email,
                                          pic: user.pic,
                                          token: generateToken(user._id),
                            })
                            
                            }else{
                                          res.status(400);
                                          throw new Error('Failed to create the User')
              }
}))
            
//Signin router
router.post('/signin', asyncHandler(async (req: Request, res: Response)=>{
              const {name,  password  } = req.body
            
              if( !password || !name ){
                            res.status(400);
                            throw new Error('Please enter all the feilds')
              }
            
              const user = await User.findOne({$or: [{username: name}, {email: name},]})
            
            
              if (user && (await user.comparePassword(password))){
                            res.status(201).json({
                                          id: user._id,
                                          name: user.name,
                                          username: user.username,
                                          email: user.email,
                                          pic: user.pic,
                                          token: generateToken(user._id),
                            })
                            }else{
                                          res.status(400);
                                          throw new Error('Invalid username or password')
              }
}))

//get user/users
router.get('/', authenticate, async(req: Request, res: Response)=>{
   const keyword = req.query.search

   try {
     const users = await User.find(keyword ? {
           $or: [
             { username: { $regex: keyword, $options: 'i' } },
             { email: { $regex: keyword, $options: 'i' } }
           ]
     } : {  }).find({_id: {$ne: req.user._id}});
 
     res.json(users);
   } catch (error) {
     res.status(500).json({ error: 'An error occurred while fetching users.' });
   }
})            

//change username
router.put('/rename', authenticate, async (req: Request, res: Response) => {
  try {
    const  username: string = req.body.username
const userId = req.user._id
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
      },
      {
        new: true,
      }
    )

    if (!updatedUser) {
      return res.status(404).send('User Not Found');
    }

    res.status(201).json({
      id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      pic: updatedUser.pic,
      token: generateToken(updatedUser._id),
    })
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
}); 

//update profile icon
router.put('/updatepic', authenticate, async (req: Request, res: Response) => {
  try {
    const  pic: string = req.body.pic
const userId = req.user._id
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        pic,
      },
      {
        new: true,
      }
    )

    if (!updatedUser) {
      return res.status(404).send('Chat Not Found');
    }

    res.status(201).json({
      id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      pic: updatedUser.pic,
      token: generateToken(updatedUser._id),
    })
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

export default router;

