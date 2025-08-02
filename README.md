# FlexiBio Builder - Enhanced Personal Linktree

A comprehensive personal linktree application that surpasses linktr.ee functionality, built with React + Vite frontend and Supabase backend.

## 🚀 Features

### ✅ Current Features (MVP Complete)
- **Dynamic Link Management** - Add, edit, delete, and reorder links
- **Profile Customization** - Custom bio, profile image, themes, and backgrounds
- **Click Analytics** - Track link clicks with detailed statistics
- **SEO Optimization** - Complete meta tags, Open Graph, Twitter Cards
- **Mobile Responsive** - Beautiful design on all devices
- **Admin Panel** - Full-featured dashboard for content management
- **Real-time Updates** - Live changes via Supabase real-time
- **Theme System** - Multiple predefined themes and custom CSS support

### 📊 Analytics & SEO
- Google Analytics integration
- Google Tag Manager support
- Facebook Pixel tracking
- Custom meta tags and Open Graph
- Twitter Card optimization
- Canonical URLs and robots directives

### 🎨 Customization
- Multiple themes (Modern, Minimal, Colorful, Dark)
- Background options (Solid, Gradient, Image)
- Custom CSS injection
- Custom head/body code injection

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

- 📚 **[Supabase Setup Guide](./docs/SUPABASE_SETUP.md)** - Database configuration and schema setup
- ☁️ **[AWS Setup Guide](./docs/AWS_SETUP.md)** - S3, CloudFront, and IAM configuration with least privilege policies
- 🔐 **[GitHub Secrets Guide](./docs/GITHUB_SECRETS.md)** - Complete GitHub Actions secrets configuration
- 🚀 **[Deployment Guide](./docs/DEPLOYMENT.md)** - Complete deployment process and troubleshooting

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

### Admin Panel
Access `/admin` for:
- **Links Management**: Add, edit, delete, and reorder links
- **Profile Settings**: Update bio, themes, SEO configuration
- **Analytics Dashboard**: View click statistics and performance

### SEO Features
- Custom meta titles and descriptions
- Open Graph and Twitter Card tags
- Canonical URLs and robots directives
- Custom head/body code injection

## 🔧 Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Deployed at**: [https://linktree.alexkm.com](https://linktree.alexkm.com)
