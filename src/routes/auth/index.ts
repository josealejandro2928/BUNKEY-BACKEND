import { simpleValidate } from './../../utils/index';
import { User } from './../../models/user.model';
import { Express, Request, Response } from 'express';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export class AuthRouter {
  private app: Express = undefined;
  private path: string = '/auth';

  constructor(_app: Express) {
    if (!_app) throw new Error('An express instance needed');
    this.app = _app;
  }

  registerEndpoints() {
    this._login();
  }

  private _login() {
    this.app.get(this.path + '/login', async (req: Request, res: Response) => {
      try {
        const { authorization } = req.headers;
        if (!authorization) {
          throw {
            status: 401,
            message: 'You must past an authorization header',
          };
        }
        const base64 = authorization.split('Basic ');
        if (!base64[1]) {
          throw {
            status: 401,
            message: 'Invalid request',
          };
        }
        const decodedAuth = Buffer.from(base64[1], 'base64').toString('ascii');
        const [email, password] = decodedAuth.split(':');
        if (!email || !password) {
          throw {
            status: 401,
            message: 'Invalid request',
          };
        }
        let user: any = await User.findOne({ email },'_id name email password');
        if (!user) {
          throw {
            status: 401,
            message: 'The mail does not exist',
          };
        }
        if (!bcrypt.compareSync(password, user.password)) {
          throw {
            status: 401,
            message: 'Invalid password',
          };
        }
        user = user.toJSON();
        delete user.password
        const jwtSignature = jwt.sign(
          {
            data: user,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '10h',
          }
        );
        const response = { profile: user, token: `Bearer ${jwtSignature}` };
        return res.status(200).json(response);
      } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
      }
    });
  }
}
