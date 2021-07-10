import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const enrollmentSchema = new mongoose.Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'courses',
    },
    students: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'students',
          required: true,
        },
        credits: {
          type: Number,
          dafault: 0,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Enrollment = mongoose.model('enrollments', enrollmentSchema);
