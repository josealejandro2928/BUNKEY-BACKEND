import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
//////////// IMPORTING MONGO SETUP ////////
import * as db from './models/index';
import { UserRouter } from './routes/user/index';
import { StudentRouter } from './routes/student/index';
import { CourseRouter } from './routes/course/index';
import { EnrollmentRouter } from './routes/enrollment/index';
import { AuthRouter } from './routes/auth';
import { ReportRouter } from './routes/reports';
import { Seeders } from './seeders';
import { Server } from 'http';
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

//Swagger Configuration
import { paths } from './docs/paths';
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Api test Bunkey',
      version: '1.0.0',
      contact: {
        email: 'jalejandro2928@gmail.com',
        name: 'Jose Alejandro Concepcion Alvarez',
      },
    },
    host: 'localhost:3333',
    schemes: ['http'],
    paths,
  },
  apis: ['app.ts'],
};

/////////// IMPORTING THE ROUTES ///////
export class App {
  port: number;
  app: Express;
  serverApp: Server;

  constructor() {
    dotenv.config();
    this.port = +process.env.SERVER_PORT;
    this.app = express();
    this.initializeMiddlewares();
    this.setRoutes();
  }

  initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    ///// CONFIGURATION OF MORGAN //////////
    this.app.use(morgan('dev'));
  }

  setRoutes() {
    const app = this.app;
    /**
     * @openapi
     * /:
     *   get:
     *     description: Welcome to swagger-jsdoc!
     *     responses:
     *       200:
     *         description: Returns a mysterious string.
     */
    app.get('/', (req: Request, res: Response) => {
      res.send('Hello world');
    });

    const swaggerDocs = swaggerJSDoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

    try {
      //////// Configure routes ///////////////////////////
      const userRouter = new UserRouter(this.app);
      const studentRouter = new StudentRouter(this.app);
      const courseRouter = new CourseRouter(this.app);
      const enrollmentRouter = new EnrollmentRouter(this.app);
      const authRouter = new AuthRouter(this.app);
      const reportRouter = new ReportRouter(this.app);

      ///////////// Registering routes ///////////////////
      userRouter.registerEndpoints();
      studentRouter.registerEndpoints();
      courseRouter.registerEndpoints();
      enrollmentRouter.registerEndpoints();
      authRouter.registerEndpoints();
      reportRouter.registerEndpoints();
      ///////////////////////////////////////////////
    } catch (error) {
      console.log('Error', error);
    }
  }

  async startServer(databaseUrl = '') {
    const mongoose = await db.connectDb(databaseUrl);
    this.serverApp = this.app.listen(this.port, async () => {
      // console.log(`Server started at http://localhost:${this.port}`);
      // console.log(`Node environment is: ${process.env.NODE_ENV}`);
      try {
        const seeders = new Seeders();
        await seeders.initUsers();
      } catch (error) {
        console.log('Error corriendo los seeders', error);
      }
    });
    ////////// LOGGING ///////////
    // mongoose.set('debug', (collectionName: any, method: any, query: any, doc: any) => {
    //   console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
    // });
  }
}

if (require.main === module) {
  const app = new App();
  app.startServer().catch((error) => {
    console.log('Error', error);
  });
}
