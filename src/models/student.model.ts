import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Student = mongoose.model('students', studentSchema);
