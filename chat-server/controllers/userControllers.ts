import { Request, Response } from 'express';
import User from '../models/userModels'
import generateToken from '../config/generateToken'

const registerUser = async (req: Request, res: Response)=>{
              const {name, email, password, passwordConfirmation, pic} = req.body

              if(!name || !email || !password || !passwordConfirmation){
                            res.status(400)
                            throw new Error('Please Enter all the Fields')
              }
if(password !== passwordConfirmation){
              res.status(400)
              throw new Error('Please your password do not match')
}else{
              const userExist = await User.findOne({email})

              if(userExist){
                            res.status(400);
                            throw new Error('User already exists')
              }

              const user = await User.create({
                            name,
                            email,
                            password,
                            pic,
              })

              if (user){
                            res.status(201).json({
                                          _id: user._id,
                                          name: user.name,
                                          email: user.email,
                                          password: user.password,
                                          pic: user.pic,
                                          token: generateToken(user._id),
                            })
              }else{
                            res.status(400);
                            throw new Error('Failed to create the user')
              }
}
}

const loginUser = async (req:Request, res:Response)=>{
              const {email, password} = req.body
              if (!email || !password) {
                                          throw new Error('Please provide username and password.')
                        } else {
             try{
              const user = await User.findOne({email})

              // if (user && (await user.comparePassword(password))){
              //               res.json({
              //                             _id: user._id,
              //                             name: user.name,
              //                             email: user.email,
              //                             pic: user.pic,
              //                             token: generateToken(user._id),
              //               })
              // }else{
              //               res.status(401);
              //               throw new Error('Invalid Email or Password')
              // }
}catch (error){
              return res.status(500).json({ error: 'Internal server error' });   
}
}
}



export {loginUser}
export  {registerUser}