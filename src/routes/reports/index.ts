import { Enrollment } from './../../models/enrollment.model';
import { Student } from './../../models/student.model';
import { simpleValidate } from './../../utils/index';
import { Express, Request, Response } from 'express';

export class ReportRouter {
  private app: Express = undefined;
  private path: string = '/report';

  constructor(_app: Express) {
    if (!_app) throw new Error('An express instance needed');
    this.app = _app;
  }

  registerEndpoints() {
    this.studentCreditGte50();
    this.coursesWithStudents();
  }

  private studentCreditGte50() {
    this.app.get(
      this.path + '/student-credit-gte-50',
      async (req: Request, res: Response) => {
        try {
          const response: any = { data: [] };
          let enrollments: any[] = await Enrollment.find(
            {
              'students.credits': {
                $gte: 50,
              },
            },
            'course students'
          ).populate('course', '_id name').populate('students._id', '_id name');
          enrollments = enrollments
            .sort((a, b) => {
              if (a.course.name > b.course.name) return -1;
              if (a.course.name < b.course.name) return 1;
              return 0;
            })
            .map((enrollment) => {
              enrollment.students = enrollment.students.filter(
                (item: any) => item.credits >= 50
              );
              return enrollment;
            });
          enrollments = enrollments.filter((x) => x.students.length > 0);

          response.data = enrollments;

          return res.status(200).json(response);
        } catch (error) {
          return res
            .status(error.status || 500)
            .json({ message: error.message });
        }
      }
    );
  }
  private coursesWithStudents() {
    this.app.get(
      this.path + '/courses-hight-students',
      async (req: Request, res: Response) => {
        try {
          const response: any = { data: [] };
          const enrollments: any[] = await Enrollment.find(
            {},
            'course students'
          ).populate('course', '_id name');

          const dataOutput = enrollments
            .sort((a, b) => {
              if (a.students.length > b.students.length) return -1;
              if (a.students.length < b.students.length) return 1;
              return 0;
            })
            .map((enrolment) => {
              return {
                course: enrolment.course.name,
                totalStudents: enrolment.students.length,
              };
            });

          response.data = dataOutput;

          return res.status(200).json(response);
        } catch (error) {
          return res
            .status(error.status || 500)
            .json({ message: error.message });
        }
      }
    );
  }
}
