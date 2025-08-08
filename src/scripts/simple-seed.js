const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Simple data generators
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'PHP', 'Java', 'C++', 'HTML/CSS', 'MongoDB', 'MySQL'];
const categories = ['Web Development', 'Mobile Development', 'Design', 'Data Science', 'DevOps', 'Marketing'];

const generateName = () => `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
const generateEmail = (name) => `${name.toLowerCase().replace(' ', '.')}@example.com`;

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/freelance-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  profileImage: String,
  skills: [String],
  hourlyRate: Number,
  location: String,
  bio: String,
  badges: [String],
  createdAt: { type: Date, default: Date.now }
});

const postJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  category: String,
  skills: [String],
  budget: Number,
  deadline: Date,
  status: String,
  assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const bidSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostJob' },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  proposal: String,
  timeline: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const milestoneSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostJob' },
  title: String,
  description: String,
  amount: Number,
  dueDate: Date,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const PostJob = mongoose.model('PostJob', postJobSchema);
const Bid = mongoose.model('Bid', bidSchema);
const Milestone = mongoose.model('Milestone', milestoneSchema);

const seedData = async () => {
  try {
    console.log('Starting to seed data...');

    // Clear existing data
    await User.deleteMany({});
    await PostJob.deleteMany({});
    await Bid.deleteMany({});
    await Milestone.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [];

    // Create 3 clients
    for (let i = 0; i < 3; i++) {
      const name = generateName();
      const user = new User({
        name,
        email: generateEmail(name),
        password: hashedPassword,
        role: 'client',
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        location: getRandomElement(['New York', 'London', 'Toronto', 'Sydney']),
        bio: 'Looking for talented freelancers for my projects.',
        badges: [],
        createdAt: getRandomDate(new Date(2024, 0, 1), new Date())
      });
      users.push(user);
    }

    // Create 5 freelancers
    for (let i = 0; i < 5; i++) {
      const name = generateName();
      const userSkills = [];
      for (let j = 0; j < getRandomNumber(2, 4); j++) {
        const skill = getRandomElement(skills);
        if (!userSkills.includes(skill)) {
          userSkills.push(skill);
        }
      }
      
      const user = new User({
        name,
        email: generateEmail(name),
        password: hashedPassword,
        role: 'freelancer',
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        skills: userSkills,
        hourlyRate: getRandomNumber(25, 100),
        location: getRandomElement(['New York', 'London', 'Toronto', 'Sydney']),
        bio: `Experienced ${userSkills[0]} developer with ${getRandomNumber(2, 8)} years of experience.`,
        badges: getRandomNumber(0, 1) ? ['Top Rated'] : [],
        createdAt: getRandomDate(new Date(2024, 0, 1), new Date())
      });
      users.push(user);
    }

    await User.insertMany(users);
    console.log('Created users');

    const clients = users.filter(u => u.role === 'client');
    const freelancers = users.filter(u => u.role === 'freelancer');

    // Create projects
    const projects = [];
    const projectTitles = [
      'E-commerce Website Development',
      'Mobile App for Food Delivery',
      'Company Website Redesign',
      'Database Optimization',
      'React Dashboard Development'
    ];

    for (let i = 0; i < 5; i++) {
      const client = getRandomElement(clients);
      const projectSkills = [];
      for (let j = 0; j < getRandomNumber(2, 3); j++) {
        const skill = getRandomElement(skills);
        if (!projectSkills.includes(skill)) {
          projectSkills.push(skill);
        }
      }

      const project = new PostJob({
        userId: client._id,
        title: projectTitles[i] || `Project ${i + 1}`,
        description: `This is a detailed description for ${projectTitles[i] || `Project ${i + 1}`}. We need an experienced developer to help us build this solution.`,
        category: getRandomElement(categories),
        skills: projectSkills,
        budget: getRandomNumber(500, 5000),
        deadline: getRandomDate(new Date(), new Date(2024, 11, 31)),
        status: getRandomElement(['open', 'in_progress', 'completed']),
        assignedFreelancer: getRandomNumber(0, 1) ? getRandomElement(freelancers)._id : null,
        createdAt: getRandomDate(new Date(2024, 0, 1), new Date())
      });
      projects.push(project);
    }

    await PostJob.insertMany(projects);
    console.log('Created projects');

    // Create bids
    const bids = [];
    const openProjects = projects.filter(p => p.status === 'open');
    
    for (const project of openProjects) {
      const numBids = getRandomNumber(1, 3);
      const bidders = [];
      
      for (let i = 0; i < numBids; i++) {
        let freelancer;
        do {
          freelancer = getRandomElement(freelancers);
        } while (bidders.includes(freelancer._id.toString()));
        
        bidders.push(freelancer._id.toString());
        
        const bid = new Bid({
          jobId: project._id,
          freelancerId: freelancer._id,
          amount: getRandomNumber(project.budget * 0.7, project.budget * 1.2),
          proposal: `I am interested in working on this project. I have experience with ${project.skills.join(', ')} and can deliver high-quality results.`,
          timeline: `${getRandomNumber(1, 4)} weeks`,
          status: 'pending',
          createdAt: getRandomDate(project.createdAt, new Date())
        });
        bids.push(bid);
      }
    }

    await Bid.insertMany(bids);
    console.log('Created bids');

    // Create milestones for in-progress projects
    const milestones = [];
    const inProgressProjects = projects.filter(p => p.status === 'in_progress');
    
    for (const project of inProgressProjects) {
      const numMilestones = getRandomNumber(2, 4);
      
      for (let i = 0; i < numMilestones; i++) {
        const milestone = new Milestone({
          projectId: project._id,
          title: `Milestone ${i + 1}`,
          description: `Description for milestone ${i + 1} of the project.`,
          amount: Math.floor(project.budget / numMilestones),
          dueDate: getRandomDate(new Date(), project.deadline),
          status: getRandomElement(['pending', 'in_progress', 'completed']),
          createdAt: getRandomDate(project.createdAt, new Date())
        });
        milestones.push(milestone);
      }
    }

    await Milestone.insertMany(milestones);
    console.log('Created milestones');

    console.log('\n=== Seed Data Summary ===');
    console.log(`Users created: ${users.length}`);
    console.log(`- Clients: ${clients.length}`);
    console.log(`- Freelancers: ${freelancers.length}`);
    console.log(`Projects created: ${projects.length}`);
    console.log(`Bids created: ${bids.length}`);
    console.log(`Milestones created: ${milestones.length}`);
    console.log('\nSample login credentials:');
    console.log('Email: any user email from above');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
connectDB().then(() => {
  seedData();
});