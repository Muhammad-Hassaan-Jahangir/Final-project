const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import the database connection function
// Using dynamic import for ESM module (since db.ts is using ES modules)
let connect;
try {
  // Try to import directly first (for CommonJS compatibility)
  connect = require('../../helper/db').connect;
} catch (error) {
  console.log('Using alternative connection method...');
  // If direct import fails, we'll handle the connection manually
  connect = null;
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      // For local development without .env file
      await mongoose.connect('mongodb+srv://blocklance:blocklance11@cluster0.xvqt7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    } else if (connect) {
      // Use the imported connect function if available
      await connect();
    } else {
      // Manual connection if the import failed
      await mongoose.connect(process.env.MONGO_URI);
    }
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define all models
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  bio: String,
  phone: String,
  country: String,
  city: String,
  skills: [String],
  hourlyRate: Number,
  profileImage: String,
  badges: [String],
  favoriteJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PostJob' }],
  transactionHistory: [
    {
      amount: Number,
      type: String,
      date: Date,
      description: String,
    },
  ],
}, { timestamps: true });

const postJobSchema = new mongoose.Schema({
  title: String,
  description: String,
  budget: Number,
  deadline: Date,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  clientConfirmed: { type: Boolean, default: false },
  freelancerConfirmed: { type: Boolean, default: false },
  category: String,
  skills: [String],
  attachments: [String],
  submissionFile: String,
  completionNotes: String,
  completedAt: Date,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'disputed'], default: 'pending' },
  visibility: { type: String, enum: ['public', 'private', 'invite_only'], default: 'public' },
  invitedFreelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const bidSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostJob', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  coverLetter: { type: String, required: true },
  estimatedTime: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  deadline: Date,
  amount: Number,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostJob' },
  completedAt: Date,
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  attachments: [{ type: String }],
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostJob' },
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostJob', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  reviewType: { type: String, enum: ['client_to_freelancer', 'freelancer_to_client'], required: true },
  helpful: { type: Number, default: 0 },
  skills: [{ type: String }],
}, { timestamps: true });

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  technologies: [{ type: String }],
  images: [{ url: String, caption: String }],
  projectUrl: String,
  testimonial: { client: String, comment: String },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedType: { type: String },
}, { timestamps: true });

const invitationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostJob', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  message: { type: String },
}, { timestamps: true });

const feedbackSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostJob', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

const updateSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostJob', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

// Register models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const PostJob = mongoose.models.PostJob || mongoose.model('PostJob', postJobSchema);
const Bid = mongoose.models.Bid || mongoose.model('Bid', bidSchema);
const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
const Portfolio = mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
const Update = mongoose.models.Update || mongoose.model('Update', updateSchema);

// Helper functions for generating data
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
    'Looking for an experienced developer to build a responsive web application with modern technologies.',
    'Need a skilled frontend developer to create a user-friendly interface for our existing application.',
    'Seeking a backend developer to optimize our database and API endpoints for better performance.',
    'We need a mobile app developer to create a cross-platform application for iOS and Android.',
    'Looking for someone to develop an e-commerce website with payment integration and inventory management.',
    'Need help with database design and optimization for our growing platform.',
    'Seeking a UI/UX designer to improve the user experience of our web application.',
    'Need a WordPress developer to create a custom theme and plugins for our business website.',
    'Looking for a developer to integrate multiple third-party APIs into our existing platform.',
    'Need DevOps expertise to set up our cloud infrastructure and CI/CD pipeline.'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const generatePortfolioTitle = () => {
  const titles = [
    'E-commerce Platform',
    'Social Media Dashboard',
    'Mobile Banking App',
    'Real Estate Listing Website',
    'Healthcare Management System',
    'Educational Learning Platform',
    'Travel Booking Application',
    'Restaurant Management System',
    'Fitness Tracking App',
    'Corporate Website Redesign'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
};

const generatePortfolioDescription = () => {
  const descriptions = [
    'Developed a full-featured e-commerce platform with payment processing and inventory management.',
    'Created a comprehensive dashboard for social media analytics and content management.',
    'Built a secure mobile banking application with transaction history and bill payments.',
    'Designed and developed a real estate listing website with advanced search functionality.',
    'Implemented a healthcare management system for patient records and appointment scheduling.',
    'Developed an interactive learning platform with course management and progress tracking.',
    'Created a travel booking application with hotel, flight, and activity reservations.',
    'Built a restaurant management system with table reservations and order processing.',
    'Designed a fitness tracking app with workout plans and progress monitoring.',
    'Redesigned a corporate website with improved UI/UX and content management.'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const generateCategory = () => {
  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Database Design',
    'DevOps',
    'E-commerce',
    'Content Management',
    'API Integration',
    'Cloud Services',
    'Security Implementation'
  ];
  return categories[Math.floor(Math.random() * categories.length)];
};

const generateTechnologies = () => {
  const technologies = [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask',
    'Laravel', 'Spring Boot', 'ASP.NET', 'Ruby on Rails', 'MongoDB', 'PostgreSQL',
    'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
    'Firebase', 'GraphQL', 'REST API', 'Microservices', 'CI/CD', 'Jenkins'
  ];
  const numTech = Math.floor(Math.random() * 5) + 2;
  const selectedTech = [];
  for (let i = 0; i < numTech; i++) {
    const tech = technologies[Math.floor(Math.random() * technologies.length)];
    if (!selectedTech.includes(tech)) {
      selectedTech.push(tech);
    }
  }
  return selectedTech;
};

const generateReviewComment = (isPositive = true) => {
  const positiveComments = [
    'Excellent work! Delivered on time and exceeded expectations.',
    'Great communication and high-quality work. Would hire again.',
    'Very professional and skilled. Completed the project perfectly.',
    'Outstanding service and attention to detail. Highly recommended.',
    'Fantastic experience working with this professional. Very satisfied.'
  ];
  
  const negativeComments = [
    'Missed deadlines and communication was lacking.',
    'Quality of work was below expectations. Needed multiple revisions.',
    'Had some issues with understanding requirements. Required extra guidance.',
    'Project took longer than expected. Communication could be improved.',
    'Delivered the basic requirements but lacked attention to detail.'
  ];
  
  const comments = isPositive ? positiveComments : negativeComments;
  return comments[Math.floor(Math.random() * comments.length)];
};

// Seed data function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await PostJob.deleteMany({});
    await Bid.deleteMany({});
    await Milestone.deleteMany({});
    await Message.deleteMany({});
    await Review.deleteMany({});
    await Portfolio.deleteMany({});
    await Notification.deleteMany({});
    await Invitation.deleteMany({});
    await Feedback.deleteMany({});
    await Update.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users (clients and freelancers)
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const clients = [];
    const freelancers = [];
    
    // Create 5 clients
    for (let i = 0; i < 5; i++) {
      const name = generateName();
      const client = new User({
        name,
        email: generateEmail(name, i),
        password: hashedPassword,
        role: 'client',
        bio: `I'm a client looking for talented freelancers to help with my projects.`,
        phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        country: ['USA', 'Canada', 'UK', 'Australia', 'Germany'][Math.floor(Math.random() * 5)],
        city: ['New York', 'Toronto', 'London', 'Sydney', 'Berlin'][Math.floor(Math.random() * 5)],
        profileImage: `/default-avatar.png`,
        transactionHistory: [
          {
            amount: Math.floor(Math.random() * 1000) + 500,
            type: 'deposit',
            date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            description: 'Initial account funding',
          },
        ],
      });
      
      const savedClient = await client.save();
      clients.push(savedClient);
    }
    
    // Create 10 freelancers
    for (let i = 0; i < 10; i++) {
      const name = generateName();
      const skills = generateSkills();
      const freelancer = new User({
        name,
        email: generateEmail(name, i + 5),
        password: hashedPassword,
        role: 'freelancer',
        bio: `Experienced professional with expertise in ${skills.slice(0, 3).join(', ')}.`,
        phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        country: ['USA', 'India', 'UK', 'Canada', 'Germany', 'Australia', 'France', 'Spain', 'Brazil', 'Japan'][Math.floor(Math.random() * 10)],
        city: ['New York', 'Mumbai', 'London', 'Toronto', 'Berlin', 'Sydney', 'Paris', 'Madrid', 'Sao Paulo', 'Tokyo'][Math.floor(Math.random() * 10)],
        skills,
        hourlyRate: Math.floor(Math.random() * 50) + 20,
        profileImage: `/default-avatar.png`,
        badges: Math.random() > 0.5 ? ['Top Rated', 'Rising Talent'] : ['New Freelancer'],
      });
      
      const savedFreelancer = await freelancer.save();
      freelancers.push(savedFreelancer);
      
      // Create portfolio items for each freelancer (1-3 items)
      const portfolioCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < portfolioCount; j++) {
        const portfolio = new Portfolio({
          userId: savedFreelancer._id,
          title: generatePortfolioTitle(),
          description: generatePortfolioDescription(),
          category: generateCategory(),
          technologies: generateTechnologies(),
          images: [
            { url: `/project-placeholders/${Math.floor(Math.random() * 5) + 1}.jpg`, caption: 'Project Screenshot' },
          ],
          projectUrl: Math.random() > 0.5 ? `https://example.com/project${Math.floor(Math.random() * 1000)}` : '',
          testimonial: Math.random() > 0.6 ? {
            client: generateName(),
            comment: generateReviewComment(true),
          } : null,
          featured: Math.random() > 0.7,
        });
        
        await portfolio.save();
      }
    }
    
    console.log(`Created ${clients.length} clients and ${freelancers.length} freelancers`);
    
    // Create jobs
    const jobs = [];
    for (let i = 0; i < 15; i++) {
      const client = clients[Math.floor(Math.random() * clients.length)];
      const skills = generateSkills();
      const job = new PostJob({
        title: generateJobTitle(),
        description: generateJobDescription(),
        budget: Math.floor(Math.random() * 1500) + 500,
        deadline: new Date(Date.now() + (Math.floor(Math.random() * 30) + 7) * 24 * 60 * 60 * 1000),
        userId: client._id,
        category: generateCategory(),
        skills,
        attachments: [],
        visibility: ['public', 'public', 'public', 'private', 'invite_only'][Math.floor(Math.random() * 5)],
      });
      
      const savedJob = await job.save();
      jobs.push(savedJob);
      
      // Add job to client's favorites (randomly)
      if (Math.random() > 0.7) {
        await User.findByIdAndUpdate(client._id, {
          $push: { favoriteJobs: savedJob._id }
        });
      }
    }
    
    console.log(`Created ${jobs.length} jobs`);
    
    // Create bids for jobs
    const bids = [];
    for (let job of jobs) {
      // Skip if job is invite_only
      if (job.visibility === 'invite_only') continue;
      
      // Random number of bids (0-5)
      const numBids = Math.floor(Math.random() * 6);
      const bidders = new Set();
      
      for (let i = 0; i < numBids; i++) {
        // Select a random freelancer who hasn't bid yet
        let freelancer;
        do {
          freelancer = freelancers[Math.floor(Math.random() * freelancers.length)];
        } while (bidders.has(freelancer._id.toString()));
        
        bidders.add(freelancer._id.toString());
        
        const bid = new Bid({
          jobId: job._id,
          freelancerId: freelancer._id,
          amount: job.budget - Math.floor(Math.random() * (job.budget * 0.3)),
          coverLetter: `I'm interested in this project and have experience with ${job.skills.filter(skill => freelancer.skills.includes(skill)).join(', ')}. I can deliver high-quality work within the deadline.`,
          estimatedTime: Math.floor(Math.random() * 14) + 3, // days
          status: 'pending',
        });
        
        const savedBid = await bid.save();
        bids.push(savedBid);
        
        // Create notification for client about new bid
        const notification = new Notification({
          userId: job.userId,
          type: 'bid_received',
          title: 'New Bid Received',
          message: `${freelancer.name} has placed a bid on your job: ${job.title}`,
          relatedId: savedBid._id,
          relatedType: 'Bid',
        });
        
        await notification.save();
      }
    }
    
    console.log(`Created ${bids.length} bids`);
    
    // Assign some jobs to freelancers (in_progress and completed)
    const assignedJobs = [];
    for (let i = 0; i < 7; i++) {
      if (i >= jobs.length) break;
      
      const job = jobs[i];
      const bidsForJob = bids.filter(bid => bid.jobId.toString() === job._id.toString());
      
      if (bidsForJob.length > 0) {
        const selectedBid = bidsForJob[Math.floor(Math.random() * bidsForJob.length)];
        const freelancer = freelancers.find(f => f._id.toString() === selectedBid.freelancerId.toString());
        
        // Update bid status
        await Bid.findByIdAndUpdate(selectedBid._id, { status: 'accepted' });
        
        // Update other bids for this job to rejected
        for (let bid of bidsForJob) {
          if (bid._id.toString() !== selectedBid._id.toString()) {
            await Bid.findByIdAndUpdate(bid._id, { status: 'rejected' });
            
            // Create notification for freelancer about rejected bid
            const notification = new Notification({
              userId: bid.freelancerId,
              type: 'bid_rejected',
              title: 'Bid Not Selected',
              message: `Your bid for the job "${job.title}" was not selected.`,
              relatedId: job._id,
              relatedType: 'PostJob',
            });
            
            await notification.save();
          }
        }
        
        // Update job status and assignedTo
        const isCompleted = i < 3; // First 3 jobs will be completed
        const status = isCompleted ? 'completed' : 'in_progress';
        const completedAt = isCompleted ? new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) : null;
        const submissionFile = isCompleted ? 'https://example.com/submission.zip' : null;
        const completionNotes = isCompleted ? 'Project completed as per requirements. All deliverables are included in the submission file.' : null;
        
        await PostJob.findByIdAndUpdate(job._id, {
          assignedTo: freelancer._id,
          status,
          completedAt,
          submissionFile,
          completionNotes,
          clientConfirmed: isCompleted && Math.random() > 0.3,
          freelancerConfirmed: isCompleted && Math.random() > 0.3,
          paymentStatus: isCompleted ? (Math.random() > 0.7 ? 'paid' : 'pending') : 'pending',
        });
        
        assignedJobs.push({
          job,
          freelancer,
          isCompleted,
        });
        
        // Create notification for freelancer about accepted bid
        const notification = new Notification({
          userId: freelancer._id,
          type: 'bid_accepted',
          title: 'Bid Accepted',
          message: `Your bid for the job "${job.title}" has been accepted!`,
          relatedId: job._id,
          relatedType: 'PostJob',
        });
        
        await notification.save();
        
        // Create milestones for the job
        if (Math.random() > 0.3) { // 70% of assigned jobs have milestones
          const numMilestones = Math.floor(Math.random() * 3) + 1;
          const milestoneAmount = Math.floor(job.budget / numMilestones);
          
          for (let j = 0; j < numMilestones; j++) {
            const milestoneStatus = isCompleted ? 'completed' : 
                                   (j === 0 ? (Math.random() > 0.5 ? 'completed' : 'in_progress') : 'pending');
            const milestone = new Milestone({
              title: `Milestone ${j + 1}`,
              description: ['Initial setup and planning', 'Core functionality implementation', 'Final delivery and testing'][j % 3],
              status: milestoneStatus,
              deadline: new Date(job.deadline.getTime() - (numMilestones - j) * 7 * 24 * 60 * 60 * 1000),
              amount: milestoneAmount,
              projectId: job._id,
              completedAt: milestoneStatus === 'completed' ? new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) : null,
              paymentStatus: milestoneStatus === 'completed' ? (Math.random() > 0.7 ? 'paid' : 'pending') : 'pending',
            });
            
            await milestone.save();
          }
        }
        
        // Create reviews for completed jobs
        if (isCompleted && Math.random() > 0.3) { // 70% of completed jobs have reviews
          // Client reviews freelancer
          if (Math.random() > 0.3) {
            const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
            const review = new Review({
              projectId: job._id,
              reviewerId: job.userId,
              revieweeId: freelancer._id,
              rating,
              comment: generateReviewComment(rating >= 4),
              reviewType: 'client_to_freelancer',
              helpful: Math.floor(Math.random() * 5),
              skills: freelancer.skills.slice(0, Math.floor(Math.random() * 3) + 1),
            });
            
            await review.save();
            
            // Create notification for freelancer about new review
            const notification = new Notification({
              userId: freelancer._id,
              type: 'review_received',
              title: 'New Review Received',
              message: `You've received a ${rating}-star review for the job "${job.title}".`,
              relatedId: review._id,
              relatedType: 'Review',
            });
            
            await notification.save();
          }
          
          // Freelancer reviews client
          if (Math.random() > 0.4) {
            const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
            const review = new Review({
              projectId: job._id,
              reviewerId: freelancer._id,
              revieweeId: job.userId,
              rating,
              comment: generateReviewComment(rating >= 4),
              reviewType: 'freelancer_to_client',
              helpful: Math.floor(Math.random() * 5),
            });
            
            await review.save();
            
            // Create notification for client about new review
            const notification = new Notification({
              userId: job.userId,
              type: 'review_received',
              title: 'New Review Received',
              message: `You've received a ${rating}-star review from ${freelancer.name} for the job "${job.title}".`,
              relatedId: review._id,
              relatedType: 'Review',
            });
            
            await notification.save();
          }
        }
      }
    }
    
    console.log(`Assigned ${assignedJobs.length} jobs to freelancers`);
    
    // Create invitations for some jobs
    const inviteJobs = jobs.filter(job => job.visibility === 'invite_only' || (Math.random() > 0.7 && job.status === 'pending'));
    
    for (let job of inviteJobs) {
      const numInvites = Math.floor(Math.random() * 3) + 1;
      const invitedFreelancerIds = new Set();
      
      for (let i = 0; i < numInvites; i++) {
        let freelancer;
        do {
          freelancer = freelancers[Math.floor(Math.random() * freelancers.length)];
        } while (invitedFreelancerIds.has(freelancer._id.toString()));
        
        invitedFreelancerIds.add(freelancer._id.toString());
        
        const invitation = new Invitation({
          jobId: job._id,
          freelancerId: freelancer._id,
          clientId: job.userId,
          status: ['pending', 'accepted', 'rejected'][Math.floor(Math.random() * 3)],
          message: `I'd like to invite you to work on this project based on your skills in ${job.skills.filter(skill => freelancer.skills.includes(skill)).join(', ')}.`,
        });
        
        await invitation.save();
        
        // Update job's invitedFreelancers array
        await PostJob.findByIdAndUpdate(job._id, {
          $push: { invitedFreelancers: freelancer._id }
        });
        
        // Create notification for freelancer about invitation
        const notification = new Notification({
          userId: freelancer._id,
          type: 'job_invitation',
          title: 'New Job Invitation',
          message: `You've been invited to bid on the job "${job.title}".`,
          relatedId: invitation._id,
          relatedType: 'Invitation',
        });
        
        await notification.save();
        
        // If invitation is accepted, create a bid
        if (invitation.status === 'accepted') {
          const bid = new Bid({
            jobId: job._id,
            freelancerId: freelancer._id,
            amount: job.budget - Math.floor(Math.random() * (job.budget * 0.2)),
            coverLetter: `Thank you for the invitation. I'm interested in this project and have experience with ${job.skills.filter(skill => freelancer.skills.includes(skill)).join(', ')}. I can deliver high-quality work within the deadline.`,
            estimatedTime: Math.floor(Math.random() * 14) + 3, // days
            status: 'pending',
          });
          
          await bid.save();
          
          // Create notification for client about accepted invitation
          const notification = new Notification({
            userId: job.userId,
            type: 'invitation_accepted',
            title: 'Invitation Accepted',
            message: `${freelancer.name} has accepted your invitation and placed a bid on your job: ${job.title}`,
            relatedId: bid._id,
            relatedType: 'Bid',
          });
          
          await notification.save();
        } else if (invitation.status === 'rejected') {
          // Create notification for client about rejected invitation
          const notification = new Notification({
            userId: job.userId,
            type: 'invitation_rejected',
            title: 'Invitation Rejected',
            message: `${freelancer.name} has declined your invitation for the job: ${job.title}`,
            relatedId: invitation._id,
            relatedType: 'Invitation',
          });
          
          await notification.save();
        }
      }
    }
    
    console.log(`Created invitations for ${inviteJobs.length} jobs`);
    
    // Create messages between clients and freelancers
    for (let { job, freelancer } of assignedJobs) {
      const numMessages = Math.floor(Math.random() * 10) + 3;
      const client = clients.find(c => c._id.toString() === job.userId.toString());
      
      for (let i = 0; i < numMessages; i++) {
        const isClientMessage = i % 2 === 0;
        const sender = isClientMessage ? client : freelancer;
        const receiver = isClientMessage ? freelancer : client;
        
        const messages = [
          'How is the project coming along?',
          'I\'ve made progress on the implementation. Will share an update soon.',
          'Do you have any questions about the requirements?',
          'Everything is clear. I\'m working on it now.',
          'Just checking in for an update.',
          'I\'ve completed the first milestone. Please review when you have time.',
          'The work looks good! Keep it up.',
          'Thank you for the feedback. Moving on to the next phase.',
          'Let me know if you need any clarification.',
          'I have a question about the design specifications.',
        ];
        
        const message = new Message({
          senderId: sender._id,
          receiverId: receiver._id,
          content: messages[i % messages.length],
          read: Math.random() > 0.5,
          projectId: job._id,
        });
        
        await message.save();
        
        // Create notification for unread messages
        if (!message.read) {
          const notification = new Notification({
            userId: receiver._id,
            type: 'message_received',
            title: 'New Message',
            message: `You have a new message from ${sender.name} regarding the project "${job.title}".`,
            relatedId: message._id,
            relatedType: 'Message',
          });
          
          await notification.save();
        }
      }
    }
    
    console.log(`Created messages for ${assignedJobs.length} jobs`);
    
    // Create project updates
    for (let { job, freelancer, isCompleted } of assignedJobs) {
      if (job.status === 'in_progress' || isCompleted) {
        const numUpdates = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numUpdates; i++) {
          const updates = [
            'I\'ve completed the initial setup and project structure. Moving on to implementing the core features.',
            'Made significant progress on the main functionality. Everything is on track for the deadline.',
            'Completed the backend integration. Now working on the frontend components.',
            'Fixed several bugs and improved performance. The application is now running smoothly.',
            'Implemented all requested features. Ready for testing and feedback.',
          ];
          
          const update = new Update({
            projectId: job._id,
            userId: freelancer._id,
            content: updates[i % updates.length],
          });
          
          await update.save();
        }
      }
    }
    
    console.log(`Created updates for ${assignedJobs.length} jobs`);
    
    // Create feedback for some completed jobs
    for (let { job, isCompleted } of assignedJobs) {
      if (isCompleted && Math.random() > 0.5) {
        const client = clients.find(c => c._id.toString() === job.userId.toString());
        
        const feedbacks = [
          'The project was completed successfully and met all requirements.',
          'Very satisfied with the quality of work and professionalism.',
          'The freelancer did an excellent job and delivered on time.',
          'Great communication throughout the project. Would hire again.',
          'The final product exceeded my expectations. Highly recommended.',
        ];
        
        const feedback = new Feedback({
          projectId: job._id,
          userId: client._id,
          comment: feedbacks[Math.floor(Math.random() * feedbacks.length)],
        });
        
        await feedback.save();
      }
    }
    
    console.log('Seed data created successfully');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the seed function
connectDB().then(() => {
  seedData();
});