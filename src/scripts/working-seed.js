const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

// Define all schemas inline

// Simple data generators to replace faker
const generateName = () => {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna', 'James', 'Maria', 'Robert', 'Jessica', 'Michael', 'Ashley'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateEmail = (name, index = 0) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  const uniqueId = Math.floor(Math.random() * 10000) + index;
  return `${cleanName}.${uniqueId}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const generateSkills = () => {
  const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'Express', 'HTML', 'CSS', 'TypeScript', 'Vue.js', 'Angular', 'PHP', 'Laravel', 'MySQL', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'Figma', 'Photoshop'];
  const numSkills = Math.floor(Math.random() * 5) + 3;
  const selectedSkills = [];
  for (let i = 0; i < numSkills; i++) {
    const skill = skills[Math.floor(Math.random() * skills.length)];
    if (!selectedSkills.includes(skill)) {
      selectedSkills.push(skill);
    }
  }
  return selectedSkills;
};

const generateJobTitle = () => {
  const titles = [
    'Full Stack Web Developer Needed',
    'React Frontend Developer',
    'Node.js Backend Developer',
    'Mobile App Development',
    'E-commerce Website Development',
    'Database Design and Optimization',
    'UI/UX Design for Web App',
    'WordPress Website Development',
    'API Development and Integration',
    'DevOps and Cloud Setup'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
};

const generateJobDescription = () => {
  const descriptions = [
    'Looking for an experienced developer to build a modern web application with responsive design and user authentication.',
    'Need a skilled developer to create a scalable backend API with database integration and security features.',
    'Seeking a creative developer to build an interactive frontend with modern frameworks and best practices.',
    'Looking for a full-stack developer to create a complete web solution from database to user interface.',
    'Need an expert developer to optimize existing codebase and implement new features with clean architecture.'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Define schemas directly (simplified versions)

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['freelancer', 'client'], required: true },
  skills: [String],
  hourlyRate: Number,
  bio: String,
  profilePicture: String,
  location: String,
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  portfolio: [{
    title: String,
    description: String,
    imageUrl: String,
    projectUrl: String,
    technologies: [String],
    date: { type: Date, default: Date.now }
  }]
});

const postJobSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: Date,
  skillsRequired: [String],
  category: String,
  projectType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
  experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'intermediate' },
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'cancelled'], default: 'open' },
  clientId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  assignedFreelancer: { type: Schema.Types.ObjectId, ref: 'users' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const bidSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'postjobs', required: true },
  freelancerId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  amount: { type: Number, required: true },
  proposal: { type: String, required: true },
  deliveryTime: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const milestoneSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'postjobs', required: true },
  title: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true },
  dueDate: Date,
  status: { type: String, enum: ['pending', 'in_progress', 'submitted', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

const reviewSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'postjobs', required: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  revieweeId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['bid_received', 'bid_accepted', 'bid_rejected', 'project_completed', 'milestone_completed', 'message_received', 'payment_received', 'review_received'], required: true },
  isRead: { type: Boolean, default: false },
  relatedId: Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.models.users || mongoose.model('users', userSchema);
const PostJob = mongoose.models.postjobs || mongoose.model('postjobs', postJobSchema);
const Bid = mongoose.models.bids || mongoose.model('bids', bidSchema);
const Milestone = mongoose.models.milestones || mongoose.model('milestones', milestoneSchema);
const Review = mongoose.models.reviews || mongoose.model('reviews', reviewSchema);
const Notification = mongoose.models.notifications || mongoose.model('notifications', notificationSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://blocklance:blocklance11@cluster0.xvqt7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define additional schemas for models not defined above
const portfolioSchema = new Schema({
  freelancerId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  title: { type: String, required: true },
  description: String,
  technologies: [String],
  projectUrl: String,
  githubUrl: String,
  images: [String],
  completionDate: Date,
  category: String,
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const feedbackSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'postjobs', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  content: { type: String, required: true },
  attachments: [{
    url: String,
    fileName: String,
    fileType: String,
    fileSize: Number
  }],
  timestamp: { type: Date, default: Date.now }
});

const updateSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'postjobs', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create additional models
const Portfolio = mongoose.models.portfolios || mongoose.model('portfolios', portfolioSchema);
const Feedback = mongoose.models.feedbacks || mongoose.model('feedbacks', feedbackSchema);
const Message = mongoose.models.messages || mongoose.model('messages', messageSchema);
const Update = mongoose.models.updates || mongoose.model('updates', updateSchema);

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await PostJob.deleteMany({});
    await Bid.deleteMany({});
    await Milestone.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await Portfolio.deleteMany({});
    await Feedback.deleteMany({});
    await Message.deleteMany({});
    await Update.deleteMany({});
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Seed data
const seedData = async () => {
  try {
    console.log('Starting to seed data...');

    // Create users
    const users = [];
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create clients (30 users)
    for (let i = 0; i < 30; i++) {
      const name = generateName();
      const companies = ['Tech Innovations LLC', 'Digital Solutions Inc', 'StartupXYZ', 'Global Enterprises', 'Creative Agency Co', 'E-commerce Plus', 'FinTech Solutions', 'HealthTech Corp', 'EduPlatform Inc', 'GreenTech Ventures'];
      const locations = ['New York, USA', 'San Francisco, USA', 'London, UK', 'Toronto, Canada', 'Sydney, Australia', 'Berlin, Germany', 'Tokyo, Japan', 'Singapore', 'Dubai, UAE', 'Amsterdam, Netherlands'];
      
      const user = new User({
        name,
        email: generateEmail(name, i),
        password: hashedPassword,
        role: 'client',
        companyName: Math.random() > 0.3 ? companies[Math.floor(Math.random() * companies.length)] : undefined,
        location: locations[Math.floor(Math.random() * locations.length)],
        isVerified: Math.random() > 0.2,
        joinDate: randomDate(new Date(2023, 0, 1), new Date()),
        lastActive: randomDate(new Date(2024, 0, 1), new Date()),
        profilePicture: `https://i.pravatar.cc/150?img=${i + 1}`,
        bio: 'Looking for talented freelancers to help grow our business with quality digital solutions.'
      });
      users.push(user);
    }

    // Create freelancers (20 users)
    for (let i = 0; i < 20; i++) {
      const name = generateName();
      const locations = ['Remote', 'New York, USA', 'Los Angeles, USA', 'London, UK', 'Berlin, Germany', 'Mumbai, India', 'Toronto, Canada', 'Sydney, Australia', 'Barcelona, Spain', 'Amsterdam, Netherlands'];
      const specializations = ['Full Stack Development', 'Frontend Development', 'Backend Development', 'Mobile App Development', 'UI/UX Design', 'DevOps Engineering', 'Data Science', 'Digital Marketing', 'Content Writing', 'Graphic Design'];
      const bios = [
        'Passionate full-stack developer with 5+ years of experience building scalable web applications.',
        'Creative UI/UX designer focused on creating intuitive and beautiful user experiences.',
        'Experienced mobile app developer specializing in React Native and Flutter.',
        'Backend engineer with expertise in Node.js, Python, and cloud technologies.',
        'Digital marketing specialist helping businesses grow their online presence.',
        'Data scientist with expertise in machine learning and analytics.',
        'DevOps engineer specializing in AWS, Docker, and CI/CD pipelines.',
        'Graphic designer creating stunning visuals for brands and businesses.',
        'Content writer crafting compelling copy that converts and engages.',
        'Frontend developer creating responsive and interactive web experiences.'
      ];
      
      const user = new User({
        name,
        email: generateEmail(name, i + 30),
        password: hashedPassword,
        role: 'freelancer',
        skills: generateSkills(),
        hourlyRate: randomInt(15, 200),
        bio: bios[Math.floor(Math.random() * bios.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        isVerified: Math.random() > 0.15,
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
        completedProjects: randomInt(0, 100),
        totalEarnings: randomInt(500, 100000),
        joinDate: randomDate(new Date(2022, 0, 1), new Date()),
        lastActive: randomDate(new Date(2024, 0, 1), new Date()),
        profilePicture: `https://i.pravatar.cc/150?img=${i + 31}`,
        specialization: specializations[Math.floor(Math.random() * specializations.length)],
        availability: Math.random() > 0.3 ? 'available' : 'busy',
        responseTime: randomInt(1, 24) + ' hours'
      });
      users.push(user);
    }

    await User.insertMany(users);
    console.log('Users created successfully');

    // Get created users
    const clients = await User.find({ role: 'client' });
    const freelancers = await User.find({ role: 'freelancer' });

    // Create portfolios for freelancers
    const portfolios = [];
    for (const freelancer of freelancers) {
      const numPortfolios = randomInt(2, 6);
      for (let i = 0; i < numPortfolios; i++) {
        const projectTitles = [
          'E-commerce Website Redesign',
          'Mobile Banking App',
          'Restaurant Management System',
          'Social Media Dashboard',
          'Learning Management Platform',
          'Real Estate Portal',
          'Healthcare Management App',
          'Inventory Management System',
          'Travel Booking Platform',
          'Fitness Tracking App',
          'Blog Platform Development',
          'CRM System Integration',
          'Payment Gateway Integration',
          'Data Analytics Dashboard',
          'Content Management System'
        ];
        
        const portfolio = new Portfolio({
          freelancerId: freelancer._id,
          title: projectTitles[Math.floor(Math.random() * projectTitles.length)],
          description: 'Successfully delivered a comprehensive solution that exceeded client expectations. Implemented modern technologies and best practices.',
          technologies: generateSkills().slice(0, randomInt(3, 6)),
          projectUrl: Math.random() > 0.3 ? `https://portfolio-demo-${i}.vercel.app` : undefined,
          githubUrl: Math.random() > 0.4 ? `https://github.com/freelancer/project-${i}` : undefined,
          images: [
            `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
            `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000) + 1000}`
          ],
          completionDate: randomDate(new Date(2022, 0, 1), new Date()),
          category: ['Web Development', 'Mobile Development', 'Design', 'Data Science', 'DevOps'][Math.floor(Math.random() * 5)],
          featured: Math.random() > 0.7,
          createdAt: randomDate(freelancer.joinDate, new Date())
        });
        portfolios.push(portfolio);
      }
    }

    await Portfolio.insertMany(portfolios);
    console.log('Portfolios created successfully');

    // Create projects (50 projects for more realistic data)
    const projects = [];
    const projectCategories = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Data Science', 'DevOps', 'Digital Marketing', 'Content Writing', 'Graphic Design', 'SEO', 'E-commerce'];
    const projectTitles = [
      'Build a Modern E-commerce Platform',
      'Develop Mobile App for Food Delivery',
      'Create Corporate Website with CMS',
      'Design User Interface for SaaS Product',
      'Develop RESTful API for Mobile App',
      'Build Real Estate Listing Platform',
      'Create Learning Management System',
      'Develop Inventory Management Software',
      'Build Social Media Analytics Dashboard',
      'Create Booking System for Hotels',
      'Develop Healthcare Management App',
      'Build Financial Trading Platform',
      'Create Content Management System',
      'Develop IoT Device Management Portal',
      'Build Customer Relationship Management System'
    ];
    
    for (let i = 0; i < 50; i++) {
      const client = clients[Math.floor(Math.random() * clients.length)];
      const category = projectCategories[Math.floor(Math.random() * projectCategories.length)];
      const title = projectTitles[Math.floor(Math.random() * projectTitles.length)];
      
      const project = new PostJob({
        title,
        description: generateJobDescription(),
        budget: randomInt(300, 25000),
        deadline: randomDate(new Date(), new Date(2025, 5, 30)),
        skillsRequired: generateSkills().slice(0, randomInt(2, 5)),
        category,
        projectType: Math.random() > 0.4 ? 'fixed' : 'hourly',
        experienceLevel: ['beginner', 'intermediate', 'expert'][Math.floor(Math.random() * 3)],
        status: ['open', 'in_progress', 'completed', 'cancelled'][Math.floor(Math.random() * 4)],
        clientId: client._id,
        priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
        attachments: Math.random() > 0.6 ? ['requirements.pdf', 'mockup.png'] : [],
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
        updatedAt: randomDate(new Date(2023, 0, 1), new Date())
      });
      projects.push(project);
    }

    await PostJob.insertMany(projects);
    console.log('Projects created successfully');

    // Get created projects
    const allProjects = await PostJob.find({});

    // Create bids (more realistic number)
    const bids = [];
    const proposals = [
      'I am excited to work on this project! With over 5 years of experience in similar projects, I can deliver high-quality results within your timeline and budget.',
      'Hello! I have carefully reviewed your project requirements and I believe I am the perfect fit. My expertise in the required technologies will ensure excellent results.',
      'Hi there! I specialize in exactly what you need for this project. I can start immediately and provide regular updates throughout the development process.',
      'Greetings! Your project aligns perfectly with my skills and experience. I have completed similar projects with 100% client satisfaction.',
      'I am very interested in your project. My portfolio demonstrates my ability to deliver exceptional work. I would love to discuss your requirements in detail.',
      'Hello! I have extensive experience in this domain and can provide innovative solutions for your project. Let me help you bring your vision to life.',
      'Hi! I am confident I can exceed your expectations for this project. My approach focuses on quality, timely delivery, and clear communication.',
      'Your project caught my attention because it matches my expertise perfectly. I can deliver professional results that will help grow your business.',
      'I have successfully completed numerous similar projects and would love to add yours to my portfolio. Quality and client satisfaction are my top priorities.',
      'Hello! I bring creativity and technical expertise to every project. I am committed to delivering work that not only meets but exceeds your expectations.'
    ];
    
    for (let i = 0; i < 150; i++) {
      const project = allProjects[Math.floor(Math.random() * allProjects.length)];
      const freelancer = freelancers[Math.floor(Math.random() * freelancers.length)];
      
      // Avoid duplicate bids from same freelancer on same project
      const existingBid = bids.find(b => b.projectId.equals(project._id) && b.freelancerId.equals(freelancer._id));
      if (existingBid) continue;
      
      const bidAmount = project.projectType === 'fixed' 
        ? randomInt(project.budget * 0.6, project.budget * 1.3)
        : randomInt(freelancer.hourlyRate * 0.8, freelancer.hourlyRate * 1.2);
      
      const bid = new Bid({
        projectId: project._id,
        freelancerId: freelancer._id,
        amount: bidAmount,
        proposal: proposals[Math.floor(Math.random() * proposals.length)],
        deliveryTime: randomInt(3, 45),
        status: ['pending', 'accepted', 'rejected', 'withdrawn'][Math.floor(Math.random() * 4)],
        coverLetter: Math.random() > 0.3 ? 'I have attached my portfolio showcasing similar work. I am available for a quick call to discuss your project in detail.' : undefined,
        createdAt: randomDate(project.createdAt, new Date()),
        updatedAt: randomDate(project.createdAt, new Date())
      });
      bids.push(bid);
    }

    await Bid.insertMany(bids);
    console.log('Bids created successfully');

    // Create milestones
    const milestones = [];
    const inProgressProjects = allProjects.filter(p => p.status === 'in_progress');
    
    for (const project of inProgressProjects) {
      const numMilestones = randomInt(2, 4);
      for (let i = 0; i < numMilestones; i++) {
        const milestone = new Milestone({
          projectId: project._id,
          title: `Milestone ${i + 1}`,
          description: `Complete phase ${i + 1} of the project`,
          amount: Math.round(project.budget / numMilestones),
          dueDate: randomDate(new Date(), project.deadline),
          status: ['pending', 'in_progress', 'submitted', 'approved'][Math.floor(Math.random() * 4)],
          createdAt: randomDate(project.createdAt, new Date())
        });
        milestones.push(milestone);
      }
    }

    await Milestone.insertMany(milestones);
    console.log('Milestones created successfully');

    // Create reviews with more variety
    const reviews = [];
    const completedProjects = allProjects.filter(p => p.status === 'completed');
    
    const clientReviewComments = [
      'Outstanding work! Exceeded my expectations in every way. Highly recommended!',
      'Great communication and delivered exactly what was requested. Will hire again!',
      'Professional, timely, and high-quality work. Very satisfied with the results.',
      'Good work overall, delivered on time but could have been more proactive in communication.',
      'Excellent technical skills and attention to detail. A pleasure to work with!',
      'Delivered as promised but took longer than expected. Quality was good though.',
      'Amazing creativity and problem-solving skills. Brought fresh ideas to the project.',
      'Solid work, met all requirements. Would consider for future projects.',
      'Exceptional quality and went above and beyond. Truly a professional!',
      'Good work but had to provide more guidance than expected. Final result was satisfactory.'
    ];
    
    const freelancerReviewComments = [
      'Excellent client! Clear requirements, prompt payments, and great communication.',
      'Very professional and understanding. Made the project enjoyable to work on.',
      'Good client overall, clear about expectations and paid on time.',
      'Great to work with! Provided helpful feedback and was very responsive.',
      'Professional client with realistic expectations. Smooth project execution.',
      'Clear communication and fair payment terms. Would work with again!',
      'Supportive client who trusted my expertise. Great working relationship.',
      'Good client but requirements changed frequently. Still managed to deliver successfully.',
      'Fantastic client! Provided all necessary resources and was very collaborative.',
      'Professional and courteous. Made the project stress-free and enjoyable.'
    ];
    
    for (const project of completedProjects) {
      const projectBids = bids.filter(b => b.projectId.equals(project._id) && b.status === 'accepted');
      
      for (const bid of projectBids) {
        // Client reviews freelancer (90% chance)
        if (Math.random() > 0.1) {
          const rating = Math.random() > 0.8 ? randomInt(1, 3) : randomInt(4, 5); // Mostly positive ratings
          const clientReview = new Review({
            projectId: project._id,
            reviewerId: project.clientId,
            revieweeId: bid.freelancerId,
            rating: rating,
            comment: clientReviewComments[Math.floor(Math.random() * clientReviewComments.length)],
            reviewType: 'client_to_freelancer',
            helpful: randomInt(0, 15),
            createdAt: randomDate(project.updatedAt, new Date())
          });
          reviews.push(clientReview);
        }
        
        // Freelancer reviews client (70% chance)
        if (Math.random() > 0.3) {
          const rating = Math.random() > 0.9 ? randomInt(2, 3) : randomInt(4, 5); // Mostly positive ratings
          const freelancerReview = new Review({
            projectId: project._id,
            reviewerId: bid.freelancerId,
            revieweeId: project.clientId,
            rating: rating,
            comment: freelancerReviewComments[Math.floor(Math.random() * freelancerReviewComments.length)],
            reviewType: 'freelancer_to_client',
            helpful: randomInt(0, 8),
            createdAt: randomDate(project.updatedAt, new Date())
          });
          reviews.push(freelancerReview);
        }
      }
    }

    await Review.insertMany(reviews);
    console.log('Reviews created successfully');

    // Create diverse notifications
    const notifications = [];
    const allUsers = [...clients, ...freelancers];
    
    const notificationTypes = [
      { type: 'bid_received', title: 'New Bid Received', message: 'You have received a new bid on your project.' },
      { type: 'bid_accepted', title: 'Bid Accepted', message: 'Congratulations! Your bid has been accepted.' },
      { type: 'bid_rejected', title: 'Bid Rejected', message: 'Unfortunately, your bid was not selected for this project.' },
      { type: 'project_completed', title: 'Project Completed', message: 'Your project has been marked as completed.' },
      { type: 'milestone_completed', title: 'Milestone Completed', message: 'A milestone has been completed for your project.' },
      { type: 'payment_received', title: 'Payment Received', message: 'You have received a payment for your completed work.' },
      { type: 'review_received', title: 'New Review', message: 'You have received a new review for your work.' },
      { type: 'message_received', title: 'New Message', message: 'You have received a new message.' }
    ];
    
    for (const user of allUsers) {
      const notificationCount = randomInt(5, 20);
      for (let i = 0; i < notificationCount; i++) {
        const notifType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const notification = new Notification({
          userId: user._id,
          title: notifType.title,
          message: notifType.message,
          type: notifType.type,
          isRead: Math.random() > 0.4, // 60% chance of being read
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          actionUrl: Math.random() > 0.5 ? `/projects/${allProjects[Math.floor(Math.random() * allProjects.length)]._id}` : undefined,
          createdAt: randomDate(user.joinDate, new Date())
        });
        notifications.push(notification);
      }
    }

    await Notification.insertMany(notifications);
    console.log('Notifications created successfully');

    // Create feedback for projects
    const feedbacks = [];
    for (const project of allProjects) {
      // Generate 1-3 feedback entries per project
      const feedbackCount = randomInt(1, 3);
      for (let i = 0; i < feedbackCount; i++) {
        const user = allUsers[Math.floor(Math.random() * allUsers.length)];
        const feedbackComments = [
          'Great project execution and communication throughout.',
          'The deliverables exceeded our expectations. Highly recommended!',
          'Professional work with attention to detail.',
          'Good collaboration and timely delivery.',
          'Excellent technical skills and problem-solving abilities.',
          'Very satisfied with the quality of work provided.',
          'Outstanding creativity and innovative solutions.',
          'Reliable and consistent performance throughout the project.',
          'Clear communication and professional approach.',
          'Delivered exactly what was promised on time.'
        ];
        
        const feedback = new Feedback({
          projectId: project._id,
          userId: user._id,
          comment: feedbackComments[Math.floor(Math.random() * feedbackComments.length)],
          createdAt: randomDate(project.createdAt, new Date())
        });
        feedbacks.push(feedback);
      }
    }
    
    await Feedback.insertMany(feedbacks);
    console.log('Feedback created successfully');

    // Create messages between users
    const messages = [];
    const messageContents = [
      'Hi! I\'m interested in your project. Could we discuss the requirements in detail?',
      'Thank you for accepting my proposal. When would be a good time to start?',
      'I have a question about the project scope. Could you clarify the timeline?',
      'Here\'s the first draft for your review. Please let me know your thoughts.',
      'The project is progressing well. I\'ll have the next milestone ready by tomorrow.',
      'Could you please review the latest updates and provide your feedback?',
      'I\'ve completed the requested changes. The project is ready for final review.',
      'Thank you for the payment. It was a pleasure working with you!',
      'I have some additional ideas that might improve the project. Interested?',
      'The project has been delivered successfully. Looking forward to future collaborations!'
    ];
    
    // Generate messages between clients and freelancers
    for (let i = 0; i < 200; i++) {
      const sender = allUsers[Math.floor(Math.random() * allUsers.length)];
      let receiver;
      do {
        receiver = allUsers[Math.floor(Math.random() * allUsers.length)];
      } while (receiver._id.equals(sender._id));
      
      const hasAttachment = Math.random() > 0.8; // 20% chance of attachment
      const attachments = hasAttachment ? [{
        url: `https://example.com/files/document_${randomInt(1000, 9999)}.pdf`,
        fileName: `project_document_${randomInt(1, 100)}.pdf`,
        fileType: 'application/pdf',
        fileSize: randomInt(50000, 2000000) // 50KB to 2MB
      }] : [];
      
      const message = new Message({
        senderId: sender._id,
        receiverId: receiver._id,
        content: messageContents[Math.floor(Math.random() * messageContents.length)],
        attachments: attachments,
        timestamp: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()) // Last 30 days
      });
      messages.push(message);
    }
    
    await Message.insertMany(messages);
    console.log('Messages created successfully');

    // Create project updates
    const updates = [];
    for (const project of allProjects) {
      // Generate 2-5 updates per project
      const updateCount = randomInt(2, 5);
      for (let i = 0; i < updateCount; i++) {
        const user = Math.random() > 0.5 ? 
          clients.find(c => c._id.equals(project.clientId)) : 
          freelancers[Math.floor(Math.random() * freelancers.length)];
        
        const updateContents = [
          'Project milestone completed successfully. Moving to the next phase.',
          'Initial design concepts have been finalized and approved.',
          'Development is progressing as planned. Expected completion on schedule.',
          'Client feedback has been incorporated into the latest version.',
          'Testing phase completed with all issues resolved.',
          'Project requirements have been updated based on new specifications.',
          'First round of revisions completed. Ready for client review.',
          'Technical implementation is complete. Starting final optimization.',
          'All deliverables have been submitted for final approval.',
          'Project successfully completed and delivered to client.'
        ];
        
        const update = new Update({
          projectId: project._id,
          userId: user._id,
          content: updateContents[Math.floor(Math.random() * updateContents.length)],
          createdAt: randomDate(project.createdAt, new Date())
        });
        updates.push(update);
      }
    }
    
    await Update.insertMany(updates);
    console.log('Updates created successfully');

    // Create user statistics and analytics
    const userStats = [];
    
    // Generate stats for freelancers
    for (const freelancer of freelancers) {
      const freelancerBids = bids.filter(b => b.freelancerId.equals(freelancer._id));
      const acceptedBids = freelancerBids.filter(b => b.status === 'accepted');
      const freelancerReviews = reviews.filter(r => r.revieweeId.equals(freelancer._id) && r.reviewType === 'client_to_freelancer');
      
      const totalEarnings = acceptedBids.reduce((sum, bid) => sum + bid.amount, 0);
      const avgRating = freelancerReviews.length > 0 
        ? freelancerReviews.reduce((sum, review) => sum + review.rating, 0) / freelancerReviews.length 
        : 0;
      
      const stats = {
        userId: freelancer._id,
        userType: 'freelancer',
        totalProjects: acceptedBids.length,
        completedProjects: acceptedBids.filter(bid => {
          const project = allProjects.find(p => p._id.equals(bid.projectId));
          return project && project.status === 'completed';
        }).length,
        totalEarnings: totalEarnings,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: freelancerReviews.length,
        successRate: freelancerBids.length > 0 ? Math.round((acceptedBids.length / freelancerBids.length) * 100) : 0,
        responseTime: randomInt(1, 24), // hours
        profileViews: randomInt(50, 500),
        repeatClients: randomInt(0, Math.floor(acceptedBids.length * 0.3)),
        onTimeDelivery: randomInt(85, 100), // percentage
        createdAt: freelancer.createdAt,
        updatedAt: new Date()
      };
      userStats.push(stats);
    }
    
    // Generate stats for clients
    for (const client of clients) {
      const clientProjects = allProjects.filter(p => p.clientId.equals(client._id));
      const completedProjects = clientProjects.filter(p => p.status === 'completed');
      const clientReviews = reviews.filter(r => r.revieweeId.equals(client._id) && r.reviewType === 'freelancer_to_client');
      
      const totalSpent = completedProjects.reduce((sum, project) => {
        const acceptedBid = bids.find(b => b.projectId.equals(project._id) && b.status === 'accepted');
        return sum + (acceptedBid ? acceptedBid.amount : 0);
      }, 0);
      
      const avgRating = clientReviews.length > 0 
        ? clientReviews.reduce((sum, review) => sum + review.rating, 0) / clientReviews.length 
        : 0;
      
      const stats = {
        userId: client._id,
        userType: 'client',
        totalProjects: clientProjects.length,
        completedProjects: completedProjects.length,
        totalSpent: totalSpent,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: clientReviews.length,
        successRate: clientProjects.length > 0 ? Math.round((completedProjects.length / clientProjects.length) * 100) : 0,
        responseTime: randomInt(2, 48), // hours
        profileViews: randomInt(20, 200),
        repeatFreelancers: randomInt(0, Math.floor(completedProjects.length * 0.4)),
        paymentReliability: randomInt(90, 100), // percentage
        createdAt: client.createdAt,
        updatedAt: new Date()
      };
      userStats.push(stats);
    }
    
    // Note: UserStats model would need to be created and imported
    // await UserStats.insertMany(userStats);
    console.log('User statistics calculated successfully');

    console.log('\n=== SEED DATA COMPLETED SUCCESSFULLY ===');
    console.log(`Created ${users.length} users (${clients.length} clients, ${freelancers.length} freelancers)`);
    console.log(`Created ${portfolios.length} portfolio items`);
    console.log(`Created ${projects.length} projects`);
    console.log(`Created ${bids.length} bids`);
    console.log(`Created ${milestones.length} milestones`);
    console.log(`Created ${reviews.length} reviews`);
    console.log(`Created ${notifications.length} notifications`);
    console.log(`Created ${feedbacks.length} feedback entries`);
    console.log(`Created ${messages.length} messages`);
    console.log(`Created ${updates.length} project updates`);
    console.log(`Calculated ${userStats.length} user statistics`);
    
    console.log('\n=== PLATFORM STATISTICS ===');
    const totalEarnings = userStats.filter(s => s.userType === 'freelancer').reduce((sum, s) => sum + s.totalEarnings, 0);
    const avgFreelancerRating = userStats.filter(s => s.userType === 'freelancer' && s.averageRating > 0).reduce((sum, s, _, arr) => sum + s.averageRating / arr.length, 0);
    const avgClientRating = userStats.filter(s => s.userType === 'client' && s.averageRating > 0).reduce((sum, s, _, arr) => sum + s.averageRating / arr.length, 0);
    
    console.log(`💰 Total Platform Earnings: $${totalEarnings.toLocaleString()}`);
    console.log(`⭐ Average Freelancer Rating: ${avgFreelancerRating.toFixed(1)}/5.0`);
    console.log(`⭐ Average Client Rating: ${avgClientRating.toFixed(1)}/5.0`);
    console.log(`📊 Project Success Rate: ${Math.round((allProjects.filter(p => p.status === 'completed').length / allProjects.length) * 100)}%`);
    
    console.log('\n=== SAMPLE LOGIN CREDENTIALS ===');
    console.log('Client: john.smith@gmail.com / password123');
    console.log('Freelancer: jane.doe@yahoo.com / password123');
    console.log('(Note: Actual emails may vary based on random generation)');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await clearDatabase();
  await seedData();
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

main().catch(console.error);