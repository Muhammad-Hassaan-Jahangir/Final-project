import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Dynamic import for ES modules compatibility
const importDB = async () => {
  try {
    const db = await import('../../helper/db.js');
    return db.connect;
  } catch (error) {
    console.error('Error importing db module:', error);
    return null;
  }
};

// Simple data generators to replace faker
const generateName = () => {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna', 'James', 'Maria', 'Robert', 'Jessica', 'Michael', 'Ashley'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateEmail = (name) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  return `${cleanName}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const generateParagraph = () => {
  const sentences = [
    'I am a skilled professional with years of experience in my field.',
    'I deliver high-quality work on time and within budget.',
    'My expertise includes modern technologies and best practices.',
    'I have worked with clients from various industries.',
    'I am passionate about creating innovative solutions.',
    'I believe in clear communication and collaboration.',
    'My goal is to exceed client expectations.',
    'I stay updated with the latest industry trends.'
  ];
  const numSentences = Math.floor(Math.random() * 3) + 2;
  const selectedSentences = [];
  for (let i = 0; i < numSentences; i++) {
    selectedSentences.push(sentences[Math.floor(Math.random() * sentences.length)]);
  }
  return selectedSentences.join(' ');
};

const generateWords = (min = 3, max = 8) => {
  const words = ['project', 'development', 'design', 'website', 'application', 'mobile', 'frontend', 'backend', 'database', 'api', 'modern', 'responsive', 'professional', 'custom', 'innovative', 'solution', 'platform', 'system', 'interface', 'experience'];
  const numWords = Math.floor(Math.random() * (max - min + 1)) + min;
  const selectedWords = [];
  for (let i = 0; i < numWords; i++) {
    selectedWords.push(words[Math.floor(Math.random() * words.length)]);
  }
  return selectedWords.join(' ');
};

const generateUrl = () => {
  const domains = ['example.com', 'demo.com', 'sample.org', 'test.net'];
  return `https://${domains[Math.floor(Math.random() * domains.length)]}`;
};

const generateAvatar = () => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(generateName())}&background=random`;
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomBoolean = (probability = 0.5) => Math.random() < probability;
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
const randomElements = (array, min = 1, max = array.length) => {
  const count = randomInt(min, Math.min(max, array.length));
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const randomDate = (start = new Date(2023, 0, 1), end = new Date()) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
const futureDate = () => {
  const now = new Date();
  const future = new Date(now.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000); // Up to 90 days in future
  return future;
};

// Import models
import { User } from '../models/userModel.ts';
import { PostJob } from '../models/postjobModel.ts';
import { Bid } from '../models/bidModel.ts';
import { Message } from '../models/messageModel.ts';
import { Milestone } from '../models/milestoneModel.ts';
import { Feedback } from '../models/feedbackModel.ts';
import { Update } from '../models/updateModel.ts';
import { Review } from '../models/reviewModel.ts';
import { Notification } from '../models/notificationModel.ts';
import { Portfolio } from '../models/portfolioModel.ts';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connect = await importDB();
    
    if (connect) {
      await connect();
    } else {
      // Fallback to direct connection if import fails
      if (!process.env.MONGO_URI) {
        // For local development without .env file
        await mongoose.connect('mongodb://localhost:27017/fyp_freelance_platform');
      } else {
        await mongoose.connect(process.env.MONGO_URI);
      }
    }
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await PostJob.deleteMany({});
    await Bid.deleteMany({});
    await Message.deleteMany({});
    await Milestone.deleteMany({});
    await Feedback.deleteMany({});
    await Update.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await Portfolio.deleteMany({});
    console.log('Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Create users
const createUsers = async () => {
  const users = [];
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create clients
  for (let i = 0; i < 5; i++) {
    const name = generateName();
    const client = new User({
      name: name,
      email: generateEmail(name),
      password: hashedPassword,
      role: 'client',
      bio: generateParagraph(),
      profileImage: generateAvatar(),
      badges: randomElements(['Verified', 'Top Client', 'Quick Payer'], 0, 2),
      transactionHistory: [
        {
          type: 'payment',
          amount: randomInt(100, 5000),
          description: 'Project payment',
          date: randomDate(),
        },
      ],
    });
    users.push(client);
  }

  // Create freelancers
  for (let i = 0; i < 10; i++) {
    const name = generateName();
    const freelancer = new User({
      name: name,
      email: generateEmail(name),
      password: hashedPassword,
      role: 'freelancer',
      bio: generateParagraph(),
      skills: randomElements([
        'JavaScript', 'React', 'Node.js', 'Python', 'Django', 'PHP', 'Laravel',
        'Vue.js', 'Angular', 'MongoDB', 'MySQL', 'PostgreSQL', 'AWS', 'Docker',
        'Figma', 'Photoshop', 'Illustrator', 'UI/UX Design', 'Mobile Development',
        'Flutter', 'React Native', 'Swift', 'Kotlin', 'Java', 'C#', '.NET'
      ], 3, 8),
      hourlyRate: randomInt(15, 150),
      profileImage: generateAvatar(),
      badges: randomElements(['Top Rated', 'Rising Talent', 'Expert Verified', 'Quick Responder'], 0, 3),
      favoriteJobs: [],
      transactionHistory: [
        {
          type: 'earning',
          amount: randomInt(50, 3000),
          description: 'Project completion',
          date: randomDate(),
        },
      ],
    });
    users.push(freelancer);
  }

  await User.insertMany(users);
  console.log('Users created successfully');
  return users;
};

// Create projects
const createProjects = async (users) => {
  const clients = users.filter(user => user.role === 'client');
  const freelancers = users.filter(user => user.role === 'freelancer');
  const projects = [];

  const categories = [
    { name: 'Web Development', subcategories: ['Frontend', 'Backend', 'Full Stack', 'E-commerce'] },
    { name: 'Mobile Development', subcategories: ['iOS', 'Android', 'Cross Platform', 'React Native'] },
    { name: 'Design', subcategories: ['UI/UX', 'Graphic Design', 'Logo Design', 'Branding'] },
    { name: 'Data Science', subcategories: ['Machine Learning', 'Data Analysis', 'AI', 'Big Data'] },
    { name: 'Writing', subcategories: ['Content Writing', 'Copywriting', 'Technical Writing', 'Blog Writing'] },
  ];

  for (let i = 0; i < 20; i++) {
    const client = randomElement(clients);
    const category = randomElement(categories);
    const subcategory = randomElement(category.subcategories);
    const isAssigned = randomBoolean(0.6);
    const assignedFreelancer = isAssigned ? randomElement(freelancers) : null;

    const project = new PostJob({
      title: generateWords(3, 8),
      description: generateParagraph() + ' ' + generateParagraph() + ' ' + generateParagraph(),
      budget: randomInt(500, 10000),
      deadline: futureDate(),
      userId: client._id,
      assignedFreelancer: assignedFreelancer?._id || null,
      status: isAssigned ? randomElement(['in_progress', 'completed', 'under_review']) : 'open',
      clientConfirmation: isAssigned && randomBoolean(0.3),
      submissionFile: isAssigned && randomBoolean(0.4) ? {
        url: generateUrl(),
        filename: 'project_file.pdf',
        uploadedAt: randomDate(),
      } : null,
      image: `https://picsum.photos/800/600?random=${i}`,
      category: category.name,
      subcategory: subcategory,
      skills: randomElements([
        'JavaScript', 'React', 'Node.js', 'Python', 'Django', 'PHP', 'Laravel',
        'Vue.js', 'Angular', 'MongoDB', 'MySQL', 'PostgreSQL', 'AWS', 'Docker',
        'Figma', 'Photoshop', 'Illustrator', 'UI/UX Design', 'Mobile Development'
      ], 2, 5),
      jobType: randomElement(['fixed', 'hourly']),
      basicBudget: randomInt(100, 1000),
    });
    projects.push(project);
  }

  await PostJob.insertMany(projects);
  console.log('Projects created successfully');
  return projects;
};

// Create bids
const createBids = async (projects, users) => {
  const freelancers = users.filter(user => user.role === 'freelancer');
  const openProjects = projects.filter(project => project.status === 'open');
  const bids = [];

  for (const project of openProjects) {
    const numBids = randomInt(1, 8);
    const bidders = randomElements(freelancers, numBids, numBids);

    for (const freelancer of bidders) {
      const bid = new Bid({
        jobId: project._id,
        freelancerId: freelancer._id,
        amount: randomInt(Math.floor(project.basicBudget * 0.8), Math.floor(project.budget * 1.2)),
        coverLetter: generateParagraph() + ' ' + generateParagraph(),
        status: randomElement(['pending', 'accepted', 'rejected']),
      });
      bids.push(bid);
    }
  }

  await Bid.insertMany(bids);
  console.log('Bids created successfully');
  return bids;
};

// Create milestones
const createMilestones = async (projects) => {
  const activeProjects = projects.filter(project => 
    ['in_progress', 'completed', 'under_review'].includes(project.status)
  );
  const milestones = [];

  for (const project of activeProjects) {
    const numMilestones = randomInt(2, 5);
    
    for (let i = 0; i < numMilestones; i++) {
      const milestone = new Milestone({
        title: `Milestone ${i + 1}: ${generateWords(2, 5)}`,
        description: generateParagraph(),
        status: randomElement(['pending', 'in_progress', 'completed', 'approved']),
        deadline: futureDate(),
        projectId: project._id,
      });
      milestones.push(milestone);
    }
  }

  await Milestone.insertMany(milestones);
  console.log('Milestones created successfully');
  return milestones;
};

// Create messages
const createMessages = async (projects, users) => {
  const messages = [];
  const activeProjects = projects.filter(project => project.assignedFreelancer);

  for (const project of activeProjects) {
    const client = users.find(user => user._id.equals(project.userId));
    const freelancer = users.find(user => user._id.equals(project.assignedFreelancer));
    
    if (client && freelancer) {
      const numMessages = randomInt(5, 20);
      
      for (let i = 0; i < numMessages; i++) {
        const isFromClient = randomBoolean();
        const sender = isFromClient ? client : freelancer;
        const receiver = isFromClient ? freelancer : client;
        
        const messageTexts = [
          'Hi, how is the project going?',
          'I have completed the first milestone.',
          'Could you please review the latest changes?',
          'The deadline looks good, I will deliver on time.',
          'I have a question about the requirements.',
          'Great work! Please proceed with the next phase.',
          'I will send you the updated files shortly.',
          'Thank you for the feedback, I will make the changes.',
        ];
        
        const message = new Message({
          senderId: sender._id,
          receiverId: receiver._id,
          content: randomElement(messageTexts),
          attachments: randomBoolean(0.2) ? [{
            url: generateUrl(),
            filename: 'attachment.pdf',
            type: randomElement(['image', 'document', 'video']),
            size: randomInt(1024, 10485760),
          }] : [],
          timestamp: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        });
        messages.push(message);
      }
    }
  }

  await Message.insertMany(messages);
  console.log('Messages created successfully');
  return messages;
};

// Create portfolio items
const createPortfolios = async (users) => {
  const freelancers = users.filter(user => user.role === 'freelancer');
  const portfolios = [];

  for (const freelancer of freelancers) {
    const numPortfolios = randomInt(2, 6);
    
    for (let i = 0; i < numPortfolios; i++) {
      const portfolio = new Portfolio({
        userId: freelancer._id,
        title: generateWords(2, 6),
        description: generateParagraph() + ' ' + generateParagraph(),
        category: randomElement(['Web Development', 'Mobile Development', 'Design', 'Data Science']),
        technologies: randomElements(freelancer.skills, 2, Math.min(5, freelancer.skills.length)),
        images: [
          {
            url: `https://picsum.photos/800/600?random=${Date.now() + i}`,
            caption: 'Project screenshot showing the main interface.',
          },
          {
            url: `https://picsum.photos/800/600?random=${Date.now() + i + 1000}`,
            caption: 'Additional view of the completed project.',
          },
        ],
        projectUrl: generateUrl(),
        githubUrl: generateUrl(),
        completedAt: randomDate(),
        featured: randomBoolean(0.3),
      });
      portfolios.push(portfolio);
    }
  }

  await Portfolio.insertMany(portfolios);
  console.log('Portfolio items created successfully');
  return portfolios;
};

// Create reviews
const createReviews = async (projects, users) => {
  const completedProjects = projects.filter(project => project.status === 'completed');
  const reviews = [];

  for (const project of completedProjects) {
    const client = users.find(user => user._id.equals(project.userId));
    const freelancer = users.find(user => user._id.equals(project.assignedFreelancer));
    
    if (client && freelancer) {
      // Client reviews freelancer
      const clientReview = new Review({
        projectId: project._id,
        reviewerId: client._id,
        revieweeId: freelancer._id,
        rating: randomInt(3, 5),
        comment: 'Excellent work! The freelancer delivered high-quality results on time and was very professional throughout the project.',
        skills: randomElements(project.skills, 1, Math.min(3, project.skills.length)),
      });
      reviews.push(clientReview);

      // Freelancer reviews client (sometimes)
      if (randomBoolean(0.7)) {
        const freelancerReview = new Review({
          projectId: project._id,
          reviewerId: freelancer._id,
          revieweeId: client._id,
          rating: randomInt(3, 5),
          comment: 'Great client to work with! Clear requirements and prompt communication made this project a success.',
        });
        reviews.push(freelancerReview);
      }
    }
  }

  await Review.insertMany(reviews);
  console.log('Reviews created successfully');
  return reviews;
};

// Create notifications
const createNotifications = async (users, projects, bids) => {
  const notifications = [];

  for (const user of users) {
    const numNotifications = randomInt(3, 10);
    
    for (let i = 0; i < numNotifications; i++) {
      const types = user.role === 'client' 
        ? ['bid_received', 'project_completed', 'milestone_completed', 'message_received']
        : ['bid_accepted', 'bid_rejected', 'payment_received', 'message_received', 'review_received'];
      
      const type = randomElement(types);
      const titles = {
        'bid_received': 'New Bid Received',
        'project_completed': 'Project Completed',
        'milestone_completed': 'Milestone Completed',
        'message_received': 'New Message',
        'bid_accepted': 'Bid Accepted',
        'bid_rejected': 'Bid Rejected',
        'payment_received': 'Payment Received',
        'review_received': 'New Review'
      };
      
      const notification = new Notification({
        userId: user._id,
        type: type,
        title: titles[type],
        message: `You have a new ${type.replace('_', ' ')}.`,
        relatedId: randomElement([...projects, ...bids])._id,
        relatedModel: randomElement(['PostJob', 'Bid']),
        isRead: randomBoolean(0.6),
        createdAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
      });
      notifications.push(notification);
    }
  }

  await Notification.insertMany(notifications);
  console.log('Notifications created successfully');
  return notifications;
};

// Create feedback and updates
const createFeedbackAndUpdates = async (projects, users) => {
  const feedbacks = [];
  const updates = [];
  const activeProjects = projects.filter(project => project.assignedFreelancer);

  for (const project of activeProjects) {
    const client = users.find(user => user._id.equals(project.userId));
    const freelancer = users.find(user => user._id.equals(project.assignedFreelancer));
    
    if (client && freelancer) {
      // Create feedback
      const numFeedbacks = randomInt(1, 4);
      for (let i = 0; i < numFeedbacks; i++) {
        const isFromClient = randomBoolean();
        const feedbackTexts = [
          'Great progress on the project so far!',
          'Please make sure to follow the design guidelines.',
          'The latest update looks good, keep up the good work.',
          'I have some suggestions for improvement.',
        ];
        const feedback = new Feedback({
          projectId: project._id,
          userId: isFromClient ? client._id : freelancer._id,
          comment: randomElement(feedbackTexts),
        });
        feedbacks.push(feedback);
      }

      // Create updates
      const numUpdates = randomInt(2, 6);
      for (let i = 0; i < numUpdates; i++) {
        const isFromClient = randomBoolean();
        const updateTexts = [
          'Completed the initial setup and configuration.',
          'Working on the main features as discussed.',
          'Updated the design based on your feedback.',
          'Ready for the next phase of development.',
          'Uploaded the latest version for review.',
        ];
        const update = new Update({
          projectId: project._id,
          userId: isFromClient ? client._id : freelancer._id,
          content: randomElement(updateTexts),
        });
        updates.push(update);
      }
    }
  }

  await Feedback.insertMany(feedbacks);
  await Update.insertMany(updates);
  console.log('Feedback and updates created successfully');
  return { feedbacks, updates };
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearData();
    
    console.log('Creating comprehensive dummy data...');
    
    const users = await createUsers();
    const projects = await createProjects(users);
    const bids = await createBids(projects, users);
    const milestones = await createMilestones(projects);
    const messages = await createMessages(projects, users);
    const portfolios = await createPortfolios(users);
    const reviews = await createReviews(projects, users);
    const notifications = await createNotifications(users, projects, bids);
    const { feedbacks, updates } = await createFeedbackAndUpdates(projects, users);
    
    console.log('\n=== SEEDING COMPLETED ===');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${projects.length} projects`);
    console.log(`Created ${bids.length} bids`);
    console.log(`Created ${milestones.length} milestones`);
    console.log(`Created ${messages.length} messages`);
    console.log(`Created ${portfolios.length} portfolio items`);
    console.log(`Created ${reviews.length} reviews`);
    console.log(`Created ${notifications.length} notifications`);
    console.log(`Created ${feedbacks.length} feedback items`);
    console.log(`Created ${updates.length} project updates`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();