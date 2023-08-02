// routes/allRoutes.ts
import { Router, Request, Response } from 'express';
import User from '../models/userModels'
import asyncHandler from "express-async-handler"
import generateToken from '../config/generateToken'

const router: Router = Router();


//Signup router
router.post('/signup', asyncHandler(async (req: Request, res: Response)=>{
              const {name, username, email, password, pic } = req.body
            
              if(!name || !email || !password || !username ){
                            res.status(400);
                            throw new Error('Please enter all the feilds')
              }
            
              const userExists = await User.findOne({ $or: [ { username }, { email} ] })
            
              if (userExists){
                            throw new Error("User already exists")
              }
            
              const user = await User.create({
                            name, email, username, password, pic,
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
              const {username,  password, email  } = req.body
            
              if( !password || !(username || email) ){
                            res.status(400);
                            throw new Error('Please enter all the feilds')
              }
            
              const user = await User.findOne({ $or: [ { username }, { email } ] } )
            
            
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

export default router;

