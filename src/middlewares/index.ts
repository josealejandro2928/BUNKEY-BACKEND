import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user.model';
const jwt = require('jsonwebtoken');

export class AuthMidd {
  constructor() {}
  async ensuredAuthenticated(req: any, res: Response, next: NextFunction) {
    try {
      const authorization: any =
        req.header('Authorization') || req.query.Authorization;
      let token: string = null;
      try {
        token = authorization.split('Bearer ')[1];
      } catch (e) {
        throw { status: 401, message: 'Bad authentication' };
      }
      let user: any = await this._jwtVerify(token);
      user = await User.findById(user._id, '_id name email');
      req.loggedUser = user;
      return next();
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({ message: error.message });
    }
  }
  private _jwtVerify(token: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (error: any, decoded: any) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(decoded.data);
        }
      });
    });
  }
}
