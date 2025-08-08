# Real Implementation with Database Integration

This document provides instructions on how to set up and use the real implementation of the project with database integration.

## Overview

The project has been updated to use a real MongoDB database instead of mock data. The following features have been implemented:

- Database models for Projects, Milestones, Feedback, and Updates
- API endpoints for CRUD operations
- Real-time data fetching and updates
- User authentication integration

## Setup Instructions

### 1. Environment Configuration

Make sure you have a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 2. Install Dependencies

If you haven't already, install the required dependencies:

```bash
npm install
```

### 3. Seed the Database (Optional)

To populate the database with initial test data, run:

```bash
node src/scripts/seed-data.js
```

This will create sample users, projects, milestones, feedback, and updates for testing purposes.

### 4. Run the Development Server

```bash
npm run dev
```

## API Endpoints

The following API endpoints have been implemented:

### Projects

- `GET /api/client/projects` - Get all projects for the authenticated client with their milestones

### Milestones

- `GET /api/client/milestones?projectId=<projectId>` - Get all milestones for a specific project
- `POST /api/client/milestones` - Create a new milestone
- `GET /api/client/milestones/:id` - Get a specific milestone
- `PATCH /api/client/milestones/:id` - Update a milestone
- `DELETE /api/client/milestones/:id` - Delete a milestone

### Feedback

- `GET /api/client/project-feedback?projectId=<projectId>` - Get all feedback for a specific project
- `POST /api/client/project-feedback` - Add new feedback to a project

### Updates

- `GET /api/client/project-updates?projectId=<projectId>` - Get all updates for a specific project
- `POST /api/client/project-updates` - Add a new update to a project

## Database Models

### Milestone Model

```typescript
{
  title: String,
  description: String,
  status: 'pending' | 'in_progress' | 'completed',
  deadline: Date,
  projectId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Feedback Model

```typescript
{
  projectId: ObjectId,
  userId: ObjectId,
  comment: String,
  createdAt: Date
}
```

### Update Model

```typescript
{
  projectId: ObjectId,
  userId: ObjectId,
  content: String,
  createdAt: Date
}
```

## Usage

1. Log in as a client user
2. Navigate to the Projects Progress page
3. View your projects and their milestones
4. Select a project to see detailed progress
5. Add updates and view communication history

## Testing Accounts

If you've run the seed script, you can use these test accounts:

- **Client**:
  - Email: client@example.com
  - Password: password123

- **Freelancer**:
  - Email: freelancer@example.com
  - Password: password123