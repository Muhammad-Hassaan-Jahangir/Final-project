const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { User } = require('../models/userModel');
const { PostJob } = require('../models/postjobModel');
const { Milestone } = require('../models/milestoneModel');
const { Feedback } = require('../models/feedbackModel');
const { Update } = require('../models/updateModel');
const { Bid } = require('../models/bidModel');
const { Message } = require('../models/messageModel');

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
    await Bid.deleteMany({});
    await Message.deleteMany({});

    console.log('Cleared existing data');

    // Create multiple clients
    const clients = await User.insertMany([
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: '$2a$10$X/4ViR1pjzZ.QgX5hGJ8WeMjUV4k7NLm/bJ5.jUYH9w5HwMB/Xjxu',
        role: 'client',
        profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
        bio: 'Tech entrepreneur looking for quality development services'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        password: '$2a$10$X/4ViR1pjzZ.QgX5hGJ8WeMjUV4k7NLm/bJ5.jUYH9w5HwMB/Xjxu',
        role: 'client',
        profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
        bio: 'Marketing director seeking creative solutions'
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        password: '$2a$10$X/4ViR1pjzZ.QgX5hGJ8WeMjUV4k7NLm/bJ5.jUYH9w5HwMB/Xjxu',
        role: 'client',
        profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
        bio: 'Startup founder building the next big thing'
      }
    ]);

    // Create multiple freelancers
    const freelancers = await User.insertMany([
      {
        name: 'Alex Rodriguez',
        email: 'alex.rodriguez@example.com',
        password: '$2a$10$X/4ViR1pjzZ.QgX5hGJ8WeMjUV4k7NLm/bJ5.jUYH9w5HwMB/Xjxu',
        role: 'freelancer',
        profileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        hourlyRate: 45,
        bio: 'Full-stack developer with 5+ years experience in modern web technologies',
        badges: 12
      },
      {
        name: 'Emma Wilson',
        email: 'emma.wilson@example.com',
        password: '$2a$10$X/4ViR1pjzZ.QgX5hGJ8WeMjUV4k7NLm/bJ5.jUYH9w5HwMB/Xjxu',
        role: 'freelancer',
        profileImage: 'https://randomuser.me/api/portraits/women/5.jpg',
        skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
        hourlyRate: 35,
        bio: 'Creative UI/UX designer passionate about user-centered design',
        badges: 8
      },
      {
        name: 'David Chen',
        email: 'david.chen@example.com',
        password: '$2a$10$X/4ViR1pjzZ.QgX5hGJ8WeMjUV4k7NLm/bJ5.jUYH9w5HwMB/Xjxu',
        role: 'freelancer',
        profileImage: 'https://randomuser.me/api/portraits/men/6.jpg',
        skills: ['Python', 'Django', 'Machine Learning', 'Data Analysis'],
        hourlyRate: 55,
        bio: 'Data scientist and backend developer specializing in AI solutions',
        badges: 15
      },
      {
        name: 'Lisa Garcia',
        email: 'lisa.garcia@example.com',
        password: '$2a$10$X/4ViR1pjzZ.QgX5hGJ8WeMjUV4k7NLm/bJ5.jUYH9w5HwMB/Xjxu',
        role: 'freelancer',
        profileImage: 'https://randomuser.me/api/portraits/women/7.jpg',
        skills: ['React Native', 'Flutter', 'iOS', 'Android'],
        hourlyRate: 40,
        bio: 'Mobile app developer creating beautiful cross-platform applications',
        badges: 10
      },
      {
        name: 'James Taylor',
        email: 'james.taylor@example.com',
        password: '$2a$10$X/4ViR1pjzZ.QgX5hGJ8WeMjUV4k7NLm/bJ5.jUYH9w5HwMB/Xjxu',
        role: 'freelancer',
        profileImage: 'https://randomuser.me/api/portraits/men/8.jpg',
        skills: ['WordPress', 'PHP', 'MySQL', 'SEO'],
        hourlyRate: 30,
        bio: 'WordPress specialist and SEO expert helping businesses grow online',
        badges: 6
      }
    ]);

    console.log('Created users');

    // Create diverse projects
    const projects = await PostJob.insertMany([
      {
        title: 'E-commerce Website Development',
        description: 'Build a modern e-commerce platform with payment integration, inventory management, and admin dashboard',
        budget: 3500,
        deadline: new Date('2024-03-15'),
        userId: clients[0]._id,
        assignedTo: freelancers[0]._id,
        status: 'accepted',
        category: 'Web Development',
        subcategory: 'E-commerce',
        skills: ['React', 'Node.js', 'Stripe', 'MongoDB'],
        jobType: 'Fixed Price',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400'
      },
      {
        title: 'Mobile Fitness App',
        description: 'Create a comprehensive fitness tracking app with workout plans, nutrition tracking, and social features',
        budget: 4200,
        deadline: new Date('2024-04-20'),
        userId: clients[1]._id,
        assignedTo: freelancers[3]._id,
        status: 'accepted',
        category: 'Mobile Development',
        subcategory: 'Health & Fitness',
        skills: ['React Native', 'Firebase', 'Health APIs'],
        jobType: 'Fixed Price',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
      },
      {
        title: 'Brand Identity Design',
        description: 'Complete brand identity package including logo, color palette, typography, and brand guidelines',
        budget: 1800,
        deadline: new Date('2024-02-28'),
        userId: clients[2]._id,
        assignedTo: freelancers[1]._id,
        status: 'accepted',
        category: 'Design',
        subcategory: 'Branding',
        skills: ['Logo Design', 'Brand Strategy', 'Adobe Illustrator'],
        jobType: 'Fixed Price',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400'
      },
      {
        title: 'Data Analytics Dashboard',
        description: 'Build an interactive dashboard for business intelligence with real-time data visualization',
        budget: 2800,
        deadline: new Date('2024-03-30'),
        userId: clients[0]._id,
        assignedTo: freelancers[2]._id,
        status: 'accepted',
        category: 'Data Science',
        subcategory: 'Analytics',
        skills: ['Python', 'Plotly', 'Pandas', 'SQL'],
        jobType: 'Fixed Price',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'
      },
      {
        title: 'WordPress Blog Redesign',
        description: 'Modernize existing WordPress blog with responsive design and SEO optimization',
        budget: 1200,
        deadline: new Date('2024-02-15'),
        userId: clients[1]._id,
        assignedTo: freelancers[4]._id,
        status: 'completed',
        clientConfirmed: true,
        category: 'Web Development',
        subcategory: 'WordPress',
        skills: ['WordPress', 'CSS', 'SEO'],
        jobType: 'Fixed Price',
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400'
      },
      // Open projects for bidding
      {
        title: 'Social Media Management Tool',
        description: 'Develop a comprehensive social media management platform with scheduling, analytics, and team collaboration',
        budget: 5000,
        deadline: new Date('2024-05-30'),
        userId: clients[2]._id,
        status: 'pending',
        category: 'Web Development',
        subcategory: 'SaaS',
        skills: ['React', 'Node.js', 'Social Media APIs'],
        jobType: 'Fixed Price',
        image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400'
      },
      {
        title: 'AI Chatbot Development',
        description: 'Create an intelligent chatbot for customer service with natural language processing',
        budget: 3800,
        deadline: new Date('2024-04-15'),
        userId: clients[0]._id,
        status: 'pending',
        category: 'AI/ML',
        subcategory: 'Chatbot',
        skills: ['Python', 'NLP', 'TensorFlow', 'API Integration'],
        jobType: 'Fixed Price',
        image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400'
      }
    ]);

    console.log('Created projects');

    // Create milestones for active projects
    const milestones = [];
    
    // E-commerce project milestones
    milestones.push(
      {
        title: 'Database Design & Setup',
        description: 'Design and implement database schema for products, users, and orders',
        status: 'completed',
        deadline: new Date('2024-01-15'),
        projectId: projects[0]._id
      },
      {
        title: 'Frontend Development',
        description: 'Build responsive frontend with product catalog and shopping cart',
        status: 'in_progress',
        deadline: new Date('2024-02-15'),
        projectId: projects[0]._id
      },
      {
        title: 'Payment Integration',
        description: 'Integrate Stripe payment processing and order management',
        status: 'pending',
        deadline: new Date('2024-03-01'),
        projectId: projects[0]._id
      }
    );

    // Mobile app milestones
    milestones.push(
      {
        title: 'UI/UX Design',
        description: 'Create wireframes and design mockups for all app screens',
        status: 'completed',
        deadline: new Date('2024-01-20'),
        projectId: projects[1]._id
      },
      {
        title: 'Core Features Development',
        description: 'Implement workout tracking and nutrition logging features',
        status: 'in_progress',
        deadline: new Date('2024-03-01'),
        projectId: projects[1]._id
      }
    );

    await Milestone.insertMany(milestones);
    console.log('Created milestones');

    // Create bids for open projects
    const bids = await Bid.insertMany([
      {
        jobId: projects[5]._id, // Social Media Management Tool
        freelancerId: freelancers[0]._id,
        amount: 4800,
        coverLetter: 'I have extensive experience building SaaS platforms and social media integrations. I can deliver this project with modern tech stack and scalable architecture.'
      },
      {
        jobId: projects[5]._id,
        freelancerId: freelancers[2]._id,
        amount: 5200,
        coverLetter: 'As a full-stack developer with experience in social media APIs, I can create a robust and user-friendly platform that meets all your requirements.'
      },
      {
        jobId: projects[6]._id, // AI Chatbot
        freelancerId: freelancers[2]._id,
        amount: 3600,
        coverLetter: 'I specialize in AI/ML solutions and have built several chatbots using NLP. I can create an intelligent chatbot that provides excellent customer service.'
      }
    ]);

    console.log('Created bids');

    // Create feedback and updates
    const feedback = await Feedback.insertMany([
      {
        projectId: projects[0]._id,
        userId: freelancers[0]._id,
        comment: 'Database setup is complete. Moving on to frontend development with React and modern UI components.'
      },
      {
        projectId: projects[0]._id,
        userId: clients[0]._id,
        comment: 'Great progress! The database structure looks solid. Looking forward to seeing the frontend.'
      },
      {
        projectId: projects[1]._id,
        userId: freelancers[3]._id,
        comment: 'UI designs are ready for review. The app will have a clean, modern interface focused on user experience.'
      }
    ]);

    const updates = await Update.insertMany([
      {
        projectId: projects[0]._id,
        userId: freelancers[0]._id,
        content: 'Completed the product catalog page with search and filtering functionality. Working on shopping cart next.'
      },
      {
        projectId: projects[1]._id,
        userId: freelancers[3]._id,
        content: 'Implemented workout tracking features. Users can now log exercises and track their progress over time.'
      }
    ]);

    console.log('Created feedback and updates');

    // Create sample messages
    const messages = await Message.insertMany([
      {
        senderId: clients[0]._id,
        receiverId: freelancers[0]._id,
        content: 'Hi Alex! I wanted to check on the progress of the e-commerce project. How are things going?'
      },
      {
        senderId: freelancers[0]._id,
        receiverId: clients[0]._id,
        content: 'Hello John! The project is progressing well. I\'ve completed the database setup and I\'m now working on the frontend. Should have the product catalog ready for review by next week.'
      },
      {
        senderId: clients[1]._id,
        receiverId: freelancers[3]._id,
        content: 'The fitness app designs look amazing! I love the color scheme and the intuitive layout.'
      },
      {
        senderId: freelancers[3]._id,
        receiverId: clients[1]._id,
        content: 'Thank you! I\'m glad you like the designs. I\'ve started implementing the core features and the app is taking shape nicely.'
      }
    ]);

    console.log('Created messages');

    console.log('\n=== SEED DATA SUMMARY ===');
    console.log(`Created ${clients.length} clients`);
    console.log(`Created ${freelancers.length} freelancers`);
    console.log(`Created ${projects.length} projects`);
    console.log(`Created ${milestones.length} milestones`);
    console.log(`Created ${bids.length} bids`);
    console.log(`Created ${feedback.length} feedback entries`);
    console.log(`Created ${updates.length} updates`);
    console.log(`Created ${messages.length} messages`);
    console.log('\nDatabase seeded successfully!');
    
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