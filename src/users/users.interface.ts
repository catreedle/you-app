// user.interface.ts
import mongoose, { Document } from 'mongoose';

export interface User extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    username: string;
    password: string;
}
