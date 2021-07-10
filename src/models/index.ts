import mongoose from 'mongoose';
// import { MongoMemoryServer } from 'mongodb-memory-server';

import { Course } from './course.model';
import { Enrollment } from './enrollment.model';
import { Student } from './student.model';
import { User } from './user.model';

const connectDb = (databaseUrl = '') => {
  const url = databaseUrl || process.env.DATABASE_URL;
  // console.log('DATABASE URL: ', url);
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const closetDB = async () => {
  // await mongoose.disconnect();
  await mongoose.connection.close();
};

const models = { Student, User, Enrollment, Course };

export { connectDb, closetDB };

export default models;
