import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model('courses', courseSchema);
