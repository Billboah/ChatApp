import express from  'express'
import asyncHandler from "express-async-handler"
import User from '../models/userModels'
import generateToken from '../config/generateToken'

const router = express.Router()

router.route('/').post(asyncHandler(async (req, res)=>{
              const {name, username, email, password, pic } = req.body

              if(!name || !email || !password || !username ){
                            res.status(400);
                            throw new Error('Please enter all the feilds')
              }

              const userExists = await User.findOne({email})

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


export default router