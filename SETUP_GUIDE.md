# LifeWeeks Setup Guide

This guide will help you set up the LifeWeeks application with Supabase and Hugging Face AI integration.

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd lifeweeks
npm install
```

### 2. Environment Configuration

Copy the environment template:
```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Hugging Face Configuration  
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

### 3. Supabase Setup

#### Step 3.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready
4. Go to Settings > API to get your URL and anon key

#### Step 3.2: Configure Authentication
1. Go to Authentication > Settings
2. Enable Email authentication
3. Set Site URL to `http://localhost:3000` (for development)
4. Add your production URL when deploying

#### Step 3.3: Run Database Setup
1. Go to SQL Editor in your Supabase dashboard
2. Copy the entire content from `supabase-setup.sql`
3. Paste and run the script
4. Verify tables are created in Table Editor

### 4. Hugging Face Setup

#### Step 4.1: Get API Key
1. Go to [huggingface.co](https://huggingface.co)
2. Create an account and sign in
3. Go to Settings > Access Tokens
4. Create a new token with "Read" permissions
5. Copy the token to your `.env.local`

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔧 Troubleshooting

### Common Issues

#### 1. "new row violates row-level security policy for table users"

**Solution:** Run the database setup script from `supabase-setup.sql`. This creates the proper RLS policies and triggers.

#### 2. "relation 'public.users' does not exist"

**Solution:** The database tables haven't been created. Run the setup script in Supabase SQL Editor.

#### 3. AI features not working

**Solution:** 
- Check your Hugging Face API key is correct
- Ensure you have internet connection
- The app will fall back to simple keyword analysis if AI fails

#### 4. Events not showing in timeline

**Solution:**
- Check the database status indicator in the dashboard
- Verify your user profile exists in the users table
- Try adding sample data using the "Add Sample Data" button

### Database Verification

Run these queries in Supabase SQL Editor to verify setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check if user profile exists (replace with your user ID)
SELECT * FROM auth.users LIMIT 5;
SELECT * FROM public.users LIMIT 5;
```

## 📊 Sample Data

The application includes a sample data seeder that creates realistic life events for testing:

- **Career events:** Job changes, promotions, projects
- **Education events:** Graduations, courses, certifications  
- **Personal events:** Moving, relationships, health, family
- **Travel events:** Vacations, adventures, trips

Click "Add Sample Data" in the dashboard to populate your timeline with test data.

## 🔒 Security Notes

- RLS (Row Level Security) is enabled on all tables
- Users can only access their own data
- API routes verify authentication
- Environment variables are protected

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Update Supabase Site URL to your Vercel domain

### Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted

## 🆘 Getting Help

If you encounter issues:

1. Check the database status indicator in the dashboard
2. Look at browser console for error messages
3. Verify all environment variables are set
4. Ensure Supabase setup script was run completely
5. Check Supabase logs in the dashboard

## 🎯 Next Steps

Once setup is complete:

1. Create your account using the signup page
2. Add sample data or create your first event
3. Explore the timeline visualization
4. Try the AI-powered insights
5. Generate art for your life chapters

Enjoy mapping your life journey! 🌟
