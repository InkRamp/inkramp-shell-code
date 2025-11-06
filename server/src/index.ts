import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import organizationRoutes from './routes/organization.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import projectRoutes from './routes/project.routes';
import teamRoutes from './routes/team.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:4200', 'http://127.0.0.1:8080', 'https://opensourcekd.github.io'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/organizations', organizationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'i17e Backend API',
    version: '1.0.0',
    endpoints: {
      organizations: '/api/organizations',
      users: '/api/users',
      roles: '/api/roles',
      projects: '/api/projects',
      teams: '/api/teams',
      health: '/health',
    },
    documentation: {
      organizations: {
        'GET /api/organizations': 'Get all organizations',
        'GET /api/organizations/:id': 'Get organization by ID',
        'POST /api/organizations': 'Create new organization',
        'PUT /api/organizations/:id': 'Update organization',
        'DELETE /api/organizations/:id': 'Delete organization',
      },
      users: {
        'GET /api/users': 'Get all users (filter by ?organizationId=xxx)',
        'GET /api/users/:id': 'Get user by ID',
        'GET /api/users/team/:teamId': 'Get users by team',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user',
      },
      roles: {
        'GET /api/roles': 'Get all roles (filter by ?projectId=xxx or ?isSystemRole=true)',
        'GET /api/roles/:id': 'Get role by ID (requires ?projectId=xxx for project roles)',
        'POST /api/roles': 'Create new role (requires ?projectId=xxx)',
        'PUT /api/roles/:id': 'Update role (requires ?projectId=xxx)',
        'DELETE /api/roles/:id': 'Delete role (requires ?projectId=xxx)',
      },
      projects: {
        'GET /api/projects': 'Get all projects (filter by ?organizationId=xxx)',
        'GET /api/projects/:id': 'Get project by ID',
        'POST /api/projects': 'Create new project',
        'PUT /api/projects/:id': 'Update project',
        'DELETE /api/projects/:id': 'Delete project',
        'POST /api/projects/:id/roles': 'Add role to project',
        'DELETE /api/projects/:id/roles/:roleId': 'Remove role from project',
      },
      teams: {
        'GET /api/teams': 'Get all teams (filter by ?organizationId=xxx)',
        'GET /api/teams/:id': 'Get team by ID',
        'POST /api/teams': 'Create new team',
        'PUT /api/teams/:id': 'Update team',
        'DELETE /api/teams/:id': 'Delete team',
        'POST /api/teams/:id/members': 'Add member to team',
        'DELETE /api/teams/:id/members/:userId': 'Remove member from team',
      },
    },
    relationships: {
      'Organization -> Users': '1:n (One organization has many users)',
      'Organization -> Teams': '1:n (One organization has many teams)',
      'Team -> Users': '1:n (One team has many users)',
      'Project -> Roles': '1:n (One project has many roles)',
      'System Roles': 'Common roles shared across all organizations',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path,
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 i17e Backend API Server');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📚 Available endpoints:');
  console.log('   • Organizations: /api/organizations');
  console.log('   • Users:         /api/users');
  console.log('   • Roles:         /api/roles');
  console.log('   • Projects:      /api/projects');
  console.log('   • Teams:         /api/teams');
  console.log('');
  console.log('🔐 Zitadel Integration:');
  console.log(`   • Issuer: ${process.env.ZITADEL_ISSUER || 'Not configured'}`);
  console.log(`   • Client ID: ${process.env.ZITADEL_CLIENT_ID || 'Not configured'}`);
  console.log('═══════════════════════════════════════════════════════');
});

export default app;
