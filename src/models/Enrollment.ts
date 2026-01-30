import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProgress {
  videoId: string;
  watchedDuration: number; // in seconds
  completed: boolean;
}

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  purchaseDate: Date;
  expiryDate?: Date; // Only for RECORDED courses
  isActive: boolean;
  progress: IProgress[];
  paymentId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema({
  videoId: { type: String, required: true },
  watchedDuration: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
});

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date, // Set for RECORDED courses, null for LIVE
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    progress: [ProgressSchema],
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user-course lookup
EnrollmentSchema.index({ userId: 1, courseId: 1 });
EnrollmentSchema.index({ isActive: 1, expiryDate: 1 });

const Enrollment: Model<IEnrollment> = 
  mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

export default Enrollment;
