import { AuthMidd } from './../../middlewares/index';
import { simpleValidate } from './../../utils/index';
import { User } from './../../models/user.model';
import { Express, NextFunction, Request, Response } from 'express';
const bcrypt = require('bcrypt');

export class UserRouter {
  private app: Express = undefined;
  private path: string = '/user';
  private authMidd: AuthMidd;

  constructor(_app: Express) {
    if (!_app) throw new Error('An express instance needed');
    this.app = _app;
    this.authMidd = new AuthMidd();
  }

  registerEndpoints() {
    this._list();
    this._create();
    this._update();
    this._listOne();
    this._delete();
  }

  _create() {
    this.app.post(
      this.path,
      (req, res, next) => {
        this.authMidd.ensuredAuthenticated(req, res, next);
      },
      async (req: Request, res: Response) => {
        try {
          const response: any = {
            data: {},
          };

          const body = req.body;
          const errors = simpleValidate(['name', 'password', 'email'], body);
          if (errors.length) {
            return res.status(400).json(errors);
          }
          body.password = bcrypt.hashSync(body.password, 12);
          let newUser: any = new User(body);
          newUser = await newUser.save();
          newUser = newUser.toJSON();
          delete newUser.password;
          response.data = newUser;
          return res.status(201).json(response);
        } catch (error) {
          console.log(error);
          return res
            .status(error.status || 500)
            .json({ message: error.message });
        }
      }
    );
  }

  _list() {
    this.app.get(this.path, async (req: Request, res: Response) => {
      try {
        const response: any = {
          data: [],
        };
        const users = await User.find({}, '_id name email');
        response.data = users;
        return res.status(200).json(response);
      } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
      }
    });
  }

  _listOne() {
    this.app.get(
      this.path + '/:id',
      this._middleware,
      async (req: Request, res: Response) => {
        try {
          const response: any = {
            data: {},
          };
          const { user } = req as any;
          if (!user) {
            throw {
              status: 404,
              message: `The user with _id ${req.params.id} is not found`,
            };
          }
          response.data = user;
          return res.status(201).json(response);
        } catch (error) {
          return res
            .status(error.status || 500)
            .json({ message: error.message });
        }
      }
    );
  }

  _update() {
    this.app.patch(
      this.path + '/:id',
      (req, res, next) => {
        this.authMidd.ensuredAuthenticated(req, res, next);
      },
      this._middleware,
      async (req: Request, res: Response) => {
        try {
          const response: any = {
            data: {},
          };
          const { user } = req as any;
          if (!user) {
            throw {
              status: 404,
              message: `The user with _id ${req.params.id} is not found`,
            };
          }
          const body = req.body;
          if (body.password) {
            body.password = bcrypt.hashSync(body.password, 12);
          }
          await User.updateOne({ _id: user._id }, body);
          response.data = await User.findById(
            req.params.id || '-1',
            'id name email'
          );
          return res.status(201).json(response);
        } catch (error) {
          return res
            .status(error.status || 500)
            .json({ message: error.message });
        }
      }
    );
  }

  _delete() {
    this.app.delete(
      this.path + '/:id',
      (req, res, next) => {
        this.authMidd.ensuredAuthenticated(req, res, next);
      },
      this._middleware,
      async (req: Request, res: Response) => {
        try {
          const response: any = {
            data: {},
          };
          const { user } = req as any;
          if (!user) {
            throw {
              status: 404,
              message: `The user with _id ${req.params.id} is not found`,
            };
          }
          await user.delete();
          return res.sendStatus(204);
        } catch (error) {
          return res
            .status(error.status || 500)
            .json({ message: error.message });
        }
      }
    );
  }

  private async _middleware(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw { status: 400, message: 'The id is required' };
      const user = await User.findById(req.params.id, '_id name email');
      if (!user) {
        throw {
          status: 404,
          message: `The user with _id ${req.params.id} is not found`,
        };
      }
      req.user = user;
      return next();
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }
}
