// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModels'

interface userAuthRequest extends Request {
  user: any
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token 

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET); 
      console.log(decoded)

      const user = await User.findById(decoded.id).select("-password");
      console.log('this is user '+ user)
  
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

// export const authMiddleware =async (req: userAuthRequest, res: Response, next: NextFunction) => {
//   const token = req.headers.authorization;

//   if (!token) {
//     return res.status(401).json({ message: 'Not authorize. No token provided' });
//   }

//   try {
//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password")// Attach user ID to the request
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Not authorized. Invalid token' });
//   }
// };
