# FlexiBio Builder - Enhanced Personal Linktree

A comprehensive personal linktree application that surpasses linktr.ee functionality, built with React + Vite frontend and Supabase backend. Features enterprise-level authentication, role-based access control, and white-label customization options.

## 🚀 Features

### ✅ Current Features (Production Ready)
- **Dynamic Link Management** - Add, edit, delete, and reorder links with drag & drop
- **Profile Customization** - Custom bio, profile image, themes, and backgrounds
- **Click Analytics** - Track link clicks with detailed statistics and insights
- **SEO Optimization** - Complete meta tags, Open Graph, Twitter Cards
- **Mobile Responsive** - Beautiful design optimized for all devices
- **Admin Panel** - Full-featured dashboard with role-based access control
- **Real-time Updates** - Live changes via Supabase real-time subscriptions
- **Theme System** - Multiple predefined themes and custom CSS support
- **User Management** - Enterprise-level RBAC with admin, editor, and super admin roles
- **Authentication** - Secure email/password and magic link authentication
- **White-label Options** - Optional branding removal for professional use

### 🔐 Security & Access Control
- **Role-Based Access Control (RBAC)** - Super Admin, Admin, and Editor roles
- **Secure Authentication** - Email/password and magic link options
- **Database Security** - Row Level Security (RLS) policies
- **Production-Ready** - Magic links redirect to correct domains
- **User Validation** - Only existing Supabase users can be granted admin access
- **Audit Trail** - Track user creation, login history, and admin activities

### 📊 Analytics & SEO
- Google Analytics integration with conditional loading
- Google Tag Manager support
- Facebook Pixel tracking
- Custom meta tags and Open Graph with dynamic updates
- Twitter Card optimization
- Canonical URLs and robots directives
- **White-label SEO** - Conditional branding removal in meta tags and manifest

### 🎨 Customization & Branding
- Multiple themes (Modern, Minimal, Colorful, Dark)
- Background options (Solid, Gradient, Image)
- Custom CSS injection for advanced styling
- Custom head/body code injection
- **Optional Footer Removal** - Hide "Powered by FlexiBio Builder" branding
- **Dynamic PWA Manifest** - Personalized app metadata when branding is disabled

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Deployment**: AWS S3 + CloudFront
- **CI/CD**: GitHub Actions

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- AWS account (for deployment)

### Quick Start

1. **Clone and Setup**
```bash
git clone <repository-url>
cd flexi-bio-builder
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. **Start Development**
```bash
npm run dev
```

### Detailed Setup

For complete setup instructions, see our detailed documentation:

- 📚 **[Supabase Setup Guide](./docs/SUPABASE_SETUP.md)** - Database configuration, schema setup, and RBAC implementation
- ☁️ **[AWS Setup Guide](./docs/AWS_SETUP.md)** - S3, CloudFront, and IAM configuration with least privilege policies
- 🔐 **[GitHub Secrets Guide](./docs/GITHUB_SECRETS.md)** - Complete GitHub Actions secrets configuration
- 🚀 **[Deployment Guide](./docs/DEPLOYMENT.md)** - Complete deployment process and troubleshooting
- 📋 **[Migration Guide](./run_migrations.md)** - Database migration execution order and instructions

## 🚀 Deployment

### Automated Deployment
The application deploys automatically via GitHub Actions when you push to the `main` branch.

### Prerequisites
- Complete AWS S3 and CloudFront setup (see [AWS Setup Guide](./docs/AWS_SETUP.md))
- Configure GitHub repository secrets
- Set up custom domain with SSL

### Quick Deployment
```bash
git push origin main
# Automatic deployment triggered
# Monitor progress in GitHub Actions tab
```

For detailed deployment instructions, troubleshooting, and advanced configurations, see the **[Deployment Guide](./docs/DEPLOYMENT.md)**.

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/          # Admin panel components
│   ├── links/          # Link display components
│   ├── profile/        # Profile components
│   ├── seo/           # SEO components
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
├── integrations/      # Supabase integration
├── pages/             # Page components
├── types/             # TypeScript definitions
└── utils/             # Utility functions
```

## 🎯 Usage

### Public Interface
Visit the root URL to see your live linktree with responsive design and automatic click tracking.

### Admin Panel Authentication
Access `/admin` with secure authentication:
- **Email/Password Login** - Traditional authentication with validation
- **Magic Link Login** - Passwordless authentication via email
- **Production-Ready** - Magic links redirect to correct production domain
- **Security Validation** - Only authorized users in admin database can access

### Admin Panel Features
Based on your role, access different features:

#### 🔹 **Editor Role**
- **Links Management**: Add, edit, delete, and reorder links
- **Profile Settings**: Update bio, themes, SEO configuration, and branding options
- **Analytics Dashboard**: View click statistics and performance metrics

#### 🔹 **Admin Role** (+ Editor permissions)
- **User Management**: Grant admin access to existing Supabase users
- **Role Assignment**: Assign Editor or Admin roles to new users

#### 🔹 **Super Admin Role** (+ All permissions)
- **Full User Management**: Create, edit, activate/deactivate all admin users
- **Role Management**: Assign any role including Super Admin
- **System Administration**: Complete control over user access and permissions

### User Management System
- **Secure User Creation**: Only existing Supabase authenticated users can be granted admin access
- **Email Validation**: Ensures admin email matches authenticated user email
- **Role-Based Permissions**: Granular access control based on assigned roles
- **Audit Trail**: Track user creation, login history, and administrative activities

### SEO & Branding Features
- **Dynamic Meta Tags**: Custom titles and descriptions with conditional branding
- **Open Graph & Twitter Cards**: Optimized social media sharing
- **White-label Options**: Optional removal of FlexiBio Builder branding
- **PWA Manifest**: Dynamic app metadata based on branding preferences
- **Custom Code Injection**: Advanced customization with custom head/body code

## 🔧 Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔒 Security Features

### Authentication & Authorization
- **Supabase Auth Integration** - Secure user authentication with email/password and magic links
- **Row Level Security (RLS)** - Database-level security policies protecting all data
- **Role-Based Access Control** - Granular permissions for Super Admin, Admin, and Editor roles
- **Production Magic Links** - Secure redirect URLs for production deployment

### Data Protection
- **Environment Variable Validation** - Strict validation of required configuration
- **No Hardcoded Credentials** - All sensitive data managed through environment variables
- **Secure AWS Deployment** - CloudFront Origin Access Control, no public S3 bucket access
- **Database Triggers** - Server-side validation preventing unauthorized admin user creation

### Production Security
- **HTTPS Enforced** - SSL/TLS encryption for all connections
- **CORS Configuration** - Proper cross-origin resource sharing policies
- **Input Validation** - Client and server-side validation for all user inputs
- **Error Boundary** - Graceful error handling preventing sensitive information leaks

## 🚀 Production Notes

### Initial Setup
1. **Create Supabase Account** - Set up your database with the provided schema
2. **Run Migrations** - Execute database migrations in the correct order (see Migration Guide)
3. **Create Super Admin** - First admin user is created automatically via migration
4. **Configure Environment** - Set all required environment variables and GitHub secrets

### User Management Workflow
1. **Users Sign Up** - Users create accounts through Supabase authentication
2. **Admin Grants Access** - Existing admins select users and assign roles
3. **Role-Based Access** - Users access features based on their assigned role
4. **Audit & Management** - Track user activity and manage permissions

### Performance & Scalability
- **Real-time Updates** - Supabase subscriptions for live data changes
- **CDN Deployment** - CloudFront for global content delivery
- **Optimized Queries** - Efficient database queries with proper indexing
- **Progressive Web App** - PWA features for app-like experience

**Deployed at**: [https://linktree.alexkm.com](https://linktree.alexkm.com)
