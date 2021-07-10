import { Enrollment } from './../../models/enrollment.model';
import { Express, NextFunction, Request, Response } from 'express';
import { simpleValidate } from './../../utils/index';
import { AuthMidd } from './../../middlewares/index';

export class EnrollmentRouter {
  private app: Express = undefined;
  private path: string = '/enrollment';
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
          const errors = simpleValidate(
            [{ value: 'students', type: 'object' }, 'course'],
            body
          );
          if (errors.length) {
            return res.status(400).json(errors);
          }
          /**  PROCESANDO EL ENROLLMENT
           * 1-Eliminar duplicados en los estudiantes
           * 2-Validar que solo hay un enrollment por curso
           */
          body.students = body.students.filter((item: any, index: number) => {
            return (
              body.students.findIndex((elem: any) => {
                return elem._id + '' === item._id + '';
              }) === index
            );
          });
          await Enrollment.deleteOne({
            course: body.course,
          });
          //////////////////////////////////////////////////////////
          let newEnrollment = new Enrollment(body);

          newEnrollment = await newEnrollment.save();
          response.data = newEnrollment;
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
        const enrollments = await Enrollment.find({}, '_id course students')
          .populate('course', '_id name')
          .populate('students._id', '_id name');
        response.data = enrollments;
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
          const { enrollment } = req as any;
          if (!enrollment) {
            throw {
              status: 404,
              message: `The enrollment with _id ${req.params.id} is not found`,
            };
          }
          response.data = enrollment;
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
          const { enrollment } = req as any;
          if (!enrollment) {
            throw {
              status: 404,
              message: `The enrollment with _id ${req.params.id} is not found`,
            };
          }
          const body = req.body;
          await Enrollment.updateOne({ _id: enrollment._id }, body);
          response.data = await Enrollment.findById(
            req.params.id,
            '_id course students'
          )
            .populate('course', '_id name')
            .populate('students._id', '_id name');
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
          const { enrollment } = req as any;
          if (!enrollment) {
            throw {
              status: 404,
              message: `The enrollment with _id ${req.params.id} is not found`,
            };
          }
          await enrollment.delete();
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
      const enrollment = await Enrollment.findById(req.params.id, '_id name')
        .populate('course', '_id name')
        .populate('students._id', '_id name');
      if (!enrollment) {
        throw {
          status: 404,
          message: `The enrollment with _id ${req.params.id} is not found`,
        };
      }
      req.enrollment = enrollment;
      return next();
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }
}
