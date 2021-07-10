import { Enrollment } from './../../models/enrollment.model';
import { Student } from './../../models/student.model';
import { Express, NextFunction, Request, Response } from 'express';
import { simpleValidate } from './../../utils/index';
import { AuthMidd } from '../../middlewares/index';

export class StudentRouter {
  private app: Express = undefined;
  private path: string = '/student';
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
          let newStudent = new Student(body);
          newStudent = await newStudent.save();
          response.data = newStudent;
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
        const students = await Student.find({}, '_id name');
        response.data = students;
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
          let { student } = req as any;
          if (!student) {
            throw {
              status: 404,
              message: `The student with _id ${req.params.id} is not found`,
            };
          }
          const enrollments: any[] = await Enrollment.find({
            'students._id': student._id,
          }).populate('course');

          const courses: any[] = [];
          enrollments.map((enr) => {
            const studentCredits = enr.students.find((item: any) => {
              return item._id + '' == student._id + '';
            });
            if (studentCredits) {
              courses.push({
                course: enr.course.name,
                credits: studentCredits.credits,
              });
            }
          });
          student = student.toJSON();
          student.courses = courses;
          response.data = student;
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
          const { student } = req as any;
          if (!student) {
            throw {
              status: 404,
              message: `The student with _id ${req.params.id} is not found`,
            };
          }
          const body = req.body;
          await Student.updateOne({ _id: student._id }, body);
          response.data = await Student.findById(req.params.id, '_id name');
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
          const { student } = req as any;
          if (!student) {
            throw {
              status: 404,
              message: `The student with _id ${req.params.id} is not found`,
            };
          }
          await student.delete();
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
      const student = await Student.findById(req.params.id, '_id name');
      if (!student) {
        throw {
          status: 404,
          message: `The student with _id ${req.params.id} is not found`,
        };
      }
      req.student = student;
      return next();
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }
}
