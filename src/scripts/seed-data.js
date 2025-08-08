// This script can be used to seed the database with initial data for testing

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { User } = require('../models/userModel');
const { PostJob } = require('../models/postjobModel');
const { Milestone } = require('../models/milestoneModel');
const { Feedback } = require('../models/feedbackModel');
const { Update } = require('../models/updateModel');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await PostJob.deleteMany({});
    await Milestone.deleteMany({});
    await Feedback.deleteMany({});
    await Update.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const clientUser = await User.create({
      name: 'Client User',
      email: 'client@example.com',
      password: '$2a$10$X/4ViR1pjzZ.QgX5hGJ8WeMjUV4k7NLm/bJ5.jUYH9w5HwMB/Xjxu', // 'password123'
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    });

    const freelancerUser = await User.create({
      name: 'Freelancer User',
      email: 'freelancer@example.com',
      password: '$2a$10$X/4ViR1pjzZ.QgX5hGJ8WeMjUV4k7NLm/bJ5.jUYH9w5HwMB/Xjxu', // 'password123'
      profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      skills: ['Web Development', 'React', 'Node.js'],
      hourlyRate: 25,
    });

    console.log('Created users');

    // Create projects
    const websiteProject = await PostJob.create({
      title: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design and improved functionality',
      budget: 2000,
      deadline: new Date('2023-12-31'),
      userId: clientUser._id,
      assignedTo: freelancerUser._id,
      status: 'accepted',
      category: 'Web Development',
      skills: ['HTML', 'CSS', 'JavaScript', 'React'],
      jobType: 'Fixed Price',
    });

    const mobileAppProject = await PostJob.create({
      title: 'Mobile App Development',
      description: 'Create a mobile app for iOS and Android platforms for customer engagement',
      budget: 3500,
      deadline: new Date('2024-02-28'),
      userId: clientUser._id,
      assignedTo: freelancerUser._id,
      status: 'accepted',
      category: 'Mobile Development',
      skills: ['React Native', 'Firebase', 'UI/UX Design'],
      jobType: 'Fixed Price',
    });

    console.log('Created projects');

    // Create milestones for Website Redesign
    const websiteMilestones = [
      {
        title: 'Design Mockups',
        description: 'Create wireframes and design mockups for all pages',
        status: 'completed',
        deadline: new Date('2023-10-15'),
        projectId: websiteProject._id,
      },
      {
        title: 'Frontend Development',
        description: 'Implement the frontend using React and responsive design',
        status: 'in_progress',
        deadline: new Date('2023-11-15'),
        projectId: websiteProject._id,
      },
      {
        title: 'Backend Integration',
        description: 'Connect frontend to backend APIs and implement functionality',
        status: 'pending',
        deadline: new Date('2023-12-01'),
        projectId: websiteProject._id,
      },
      {
        title: 'Testing & Launch',
        description: 'Perform testing, bug fixes, and launch the website',
        status: 'pending',
        deadline: new Date('2023-12-20'),
        projectId: websiteProject._id,
      },
    ];

    await Milestone.insertMany(websiteMilestones);

    // Create milestones for Mobile App
    const mobileAppMilestones = [
      {
        title: 'UI/UX Design',
        description: 'Design the user interface and experience for the mobile app',
        status: 'completed',
        deadline: new Date('2023-11-01'),
        projectId: mobileAppProject._id,
      },
      {
        title: 'Frontend Development',
        description: 'Implement the frontend using React Native',
        status: 'completed',
        deadline: new Date('2023-12-01'),
        projectId: mobileAppProject._id,
      },
      {
        title: 'Backend Development',
        description: 'Implement backend APIs and database integration',
        status: 'in_progress',
        deadline: new Date('2024-01-01'),
        projectId: mobileAppProject._id,
      },
      {
        title: 'Testing',
        description: 'Perform testing on both iOS and Android platforms',
        status: 'pending',
        deadline: new Date('2024-02-01'),
        projectId: mobileAppProject._id,
      },
      {
        title: 'Deployment',
        description: 'Deploy to App Store and Google Play',
        status: 'pending',
        deadline: new Date('2024-02-15'),
        projectId: mobileAppProject._id,
      },
    ];

    await Milestone.insertMany(mobileAppMilestones);

    console.log('Created milestones');

    // Create feedback
    const websiteFeedback = [
      {
        projectId: websiteProject._id,
        userId: freelancerUser._id,
        comment: 'The design mockups are complete. Please review and provide feedback.',
        createdAt: new Date('2023-10-10'),
      },
      {
        projectId: websiteProject._id,
        userId: clientUser._id,
        comment: 'The mockups look great! I especially like the homepage design.',
        createdAt: new Date('2023-10-12'),
      },
      {
        projectId: websiteProject._id,
        userId: freelancerUser._id,
        comment: 'I\'ve started working on the frontend development. Making good progress.',
        createdAt: new Date('2023-10-20'),
      },
    ];

    await Feedback.insertMany(websiteFeedback);

    // Create updates
    const websiteUpdates = [
      {
        projectId: websiteProject._id,
        userId: freelancerUser._id,
        content: 'Completed the responsive design for all pages. Moving on to implementing interactive elements.',
        createdAt: new Date('2023-10-25'),
      },
      {
        projectId: websiteProject._id,
        userId: clientUser._id,
        content: 'I\'ve reviewed the current progress and it looks excellent. Keep up the good work!',
        createdAt: new Date('2023-10-28'),
      },
    ];

    await Update.insertMany(websiteUpdates);

    // Create feedback for mobile app
    const mobileAppFeedback = [
      {
        projectId: mobileAppProject._id,
        userId: freelancerUser._id,
        comment: 'The UI/UX designs are complete. Please take a look at the mockups.',
        createdAt: new Date('2023-10-28'),
      },
      {
        projectId: mobileAppProject._id,
        userId: clientUser._id,
        comment: 'The designs look fantastic! I love the color scheme and layout.',
        createdAt: new Date('2023-10-30'),
      },
    ];

    await Feedback.insertMany(mobileAppFeedback);

    console.log('Created feedback and updates');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding process
connectDB().then(() => {
  seedData();
});