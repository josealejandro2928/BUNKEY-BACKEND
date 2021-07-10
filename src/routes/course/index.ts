import { simpleValidate } from './../../utils/index';
import { Course } from './../../models/course.model';
import { Express, NextFunction, Request, Response } from 'express';
import { AuthMidd } from './../../middlewares/index';
import { Enrollment } from './../../models/enrollment.model';

export class CourseRouter {
  private app: Express = undefined;
  private path: string = '/course';
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
          const errors = simpleValidate(['name'], body);
          if (errors.length) {
            return res.status(400).json(errors);
          }
          let newCourse = new Course(body);
          newCourse = await newCourse.save();
          response.data = newCourse;
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
        const courses = await Course.find({}, '_id name');
        response.data = courses;
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
          let { course } = req as any;
          if (!course) {
            throw {
              status: 404,
              message: `The course with _id ${req.params.id} is not found`,
            };
          }
          const enrollment: any = await Enrollment.findOne({
            course: course.id,
          }).populate('students._id', '_id name');
          course = course.toJSON();
          course.students = enrollment
            ? enrollment.students.map((item: any) => item._id)
            : [];

          response.data = course;
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
      this._middleware,
      (req, res, next) => {
        this.authMidd.ensuredAuthenticated(req, res, next);
      },
      async (req: Request, res: Response) => {
        try {
          const response: any = {
            data: {},
          };
          const { course } = req as any;
          if (!course) {
            throw {
              status: 404,
              message: `The course with _id ${req.params.id} is not found`,
            };
          }
          const body = req.body;
          await Course.updateOne({ _id: course._id }, body);
          response.data = await Course.findById(req.params.id, '_id name');
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
          const { course } = req as any;
          if (!course) {
            throw {
              status: 404,
              message: `The course with _id ${req.params.id} is not found`,
            };
          }
          await course.delete();
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
      const course = await Course.findById(req.params.id, '_id name');
      if (!course) {
        throw {
          status: 404,
          message: `The course with _id ${req.params.id} is not found`,
        };
      }
      req.course = course;
      return next();
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }
}
