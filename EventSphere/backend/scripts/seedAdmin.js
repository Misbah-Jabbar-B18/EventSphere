import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const email = 'habibaishfaq8@eventsphere.com';
    const password = 'Admin123!';
    const hashedPassword = await bcryptjs.hash(password, 10);

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const admin = new User({
      name: 'Habiba',
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin created successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
