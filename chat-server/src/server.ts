import  express from "express";
import  cors from "cors";
import  bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from '../config/db'
import userRoutes from '../routes/userRoutes'
import asyncHandler from "express-async-handler"
import User from '../models/userModels'
import generateToken from '../config/generateToken'

dotenv.config();

connectDB()
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())


app.get('/', (req, res) => {
              res.send('Hello, world!');
            });

app.post('/api/user/signup', asyncHandler(async (req, res)=>{
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

app.post('/api/user/login', asyncHandler(async (req, res)=>{
  const {username,  password,  } = req.body

  if( !password || !username ){
                res.status(400);
                throw new Error('Please enter all the feilds')
  }

  const user = await User.findOne({ username })

  console.log(user.password)


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


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
