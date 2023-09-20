// middleware/authMiddleware.ts
import {  Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {User} from '../models/userModels'
import { CustomRequest } from '../config/express';



export const authenticate = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  let token 

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET); 

      const user = await User.findById(decoded.id).select("-password");
  
      if (!user) {
         res.status(404).json({ error: 'User not found.' });
      }
  
      req.user = user;
      next();
    } catch (error) {
       res.status(401).json({ error: 'Invalid token.' });
    }
  }

  if(!token){
    res.status(401).json({ error: 'Authorization token not found.' });
  }
};
