import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Folder from './models/Folder.js';

dotenv.config();

async function createDemo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');

    // Remove existing demo user
    const existing = await User.findOne({ email: 'demo@nestdrive.com' });
    if (existing) {
      await Folder.deleteMany({ owner: existing._id });
      await User.deleteOne({ _id: existing._id });
      console.log('Removed existing demo user');
    }

    // Create demo user
    const passwordHash = await bcrypt.hash('Demo@1234', 10);
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@nestdrive.com',
      passwordHash,
    });
    console.log('Created demo user:', user.email);

    // Create root folders
    const projects = await Folder.create({ name: 'Projects', owner: user._id, parent: null, ancestors: [] });
    const assets = await Folder.create({ name: 'Assets', owner: user._id, parent: null, ancestors: [] });
    const archive = await Folder.create({ name: 'Archive', owner: user._id, parent: null, ancestors: [] });
    console.log('Created root folders: Projects, Assets, Archive');

    // Create Campaigns inside Projects
    const campaigns = await Folder.create({
      name: 'Campaigns',
      owner: user._id,
      parent: projects._id,
      ancestors: [projects._id],
    });
    console.log('Created Campaigns inside Projects');

    // Create Summer 2025 inside Campaigns
    await Folder.create({
      name: 'Summer 2025',
      owner: user._id,
      parent: campaigns._id,
      ancestors: [projects._id, campaigns._id],
    });
    console.log('Created Summer 2025 inside Campaigns');

    console.log('\nDemo setup complete!');
    console.log('Email: demo@nestdrive.com');
    console.log('Password: Demo@1234');
  } catch (err) {
    console.error('Error creating demo:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

createDemo();
