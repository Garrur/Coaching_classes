import mongoose, { Schema, Document, Model } from 'mongoose';

export type CourseType = 'RECORDED' | 'LIVE';

export interface IVideo {
  title: string;
  url: string;
  duration: number; // in seconds
  order: number;
  moduleId: string;
}

export interface IModule {
  _id: string;
  name: string;
  order: number;
}

export interface ISchedule {
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  time: string; // HH:MM format
  meetingLink: string;
  isActive: boolean;
}

export interface ICourse extends Document {
  name: string;
  description: string;
  courseType: CourseType;
  price: number;
  thumbnail?: string;
  
  // For RECORDED courses
  validity?: number; // in months
  videos?: IVideo[];
  modules?: IModule[];
  
  // For LIVE courses
  duration?: number; // in days
  startDate?: Date;
  endDate?: Date;
  schedule?: ISchedule[];
  
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  duration: { type: Number, required: true },
  order: { type: Number, required: true },
  moduleId: { type: String, required: true },
});

const ModuleSchema = new Schema({
  name: { type: String, required: true },
  order: { type: Number, required: true },
});

const ScheduleSchema = new Schema({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  time: { type: String, required: true },
  meetingLink: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

const CourseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    courseType: {
      type: String,
      enum: ['RECORDED', 'LIVE'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    thumbnail: {
      type: String,
    },
    
    // RECORDED course fields
    validity: {
      type: Number,
      default: 6, // 6 months
    },
    videos: [VideoSchema],
    modules: [ModuleSchema],
    
    // LIVE course fields
    duration: {
      type: Number, // in days
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    schedule: [ScheduleSchema],
    
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CourseSchema.index({ courseType: 1, isActive: 1 });
CourseSchema.index({ createdBy: 1 });

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
