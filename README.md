# LifeWeeks - Your Life in 4,000 Weeks

A modern, AI-powered interactive timeline application that visualizes your life week by week. Built for hackathons with a focus on polished UX, advanced AI features, and meaningful personal insights.

![LifeWeeks Preview]([https://via.placeholder.com/800x400/3b82f6/ffffff?text=LifeWeeks+Timeline](https://lifeweeks.vercel.app/))

## 🌟 Features

### Core Functionality
- **Interactive Life Timeline**: Visualize your entire life as a grid of weeks (inspired by the "4,000 weeks" concept)
- **Smart Event Management**: Add, edit, and organize life events with intelligent categorization
- **AI-Powered Sentiment Analysis**: Automatic emotional tone detection using Hugging Face models
- **Historical Context**: Connect personal events with significant world events
- **Life Chapters**: Organize your life into meaningful phases with AI-generated artwork

### AI-Powered Features
- **Narrative Generation**: AI creates meaningful connections between personal and historical events
- **Sentiment Analysis**: Advanced emotion detection using `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Art Generation**: AI-generated prompts for life chapter artwork
- **Personal Insights**: Pattern recognition and life trend analysis
- **Smart Categorization**: Intelligent event classification

### Modern UX/UI
- **Responsive Design**: Beautiful interface that works on all devices
- **Smooth Animations**: Framer Motion powered interactions
- **Modern Landing Page**: Compelling hero sections and feature showcases
- **Dark/Light Themes**: Adaptive color schemes
- **Toast Notifications**: Real-time feedback for user actions

## 🚀 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Heroicons** for iconography
- **React Hot Toast** for notifications

### Backend & AI
- **Supabase** for authentication and database
- **Hugging Face Inference API** for AI features
- **Row Level Security** for data protection
- **Server Actions** for mutations

### Key Models Used
- `cardiffnlp/twitter-roberta-base-sentiment-latest` - Sentiment analysis
- `microsoft/DialoGPT-medium` - Text generation
- Custom fallback algorithms for reliability

## 📦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Hugging Face API key

### Installation

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd lifeweeks
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   HUGGINGFACE_API_KEY=your-huggingface-api-key
   ```

3. **Database setup**:
   Run this SQL in your Supabase SQL editor:
   ```sql
   -- Users table (extends Supabase Auth)
   create table public.users (
     id uuid references auth.users on delete cascade,
     email text,
     birthdate date,
     primary key (id)
   );

   -- Personal Events table
   create table public.personal_events (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references public.users on delete cascade,
     date timestamp with time zone,
     title text,
     description text,
     category text check (category in ('Career', 'Education', 'Personal', 'Travel')),
     sentiment text check (sentiment in ('positive', 'negative', 'neutral')),
     created_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Enable Row Level Security
   alter table public.users enable row level security;
   alter table public.personal_events enable row level security;

   -- RLS Policies
   create policy "Users can manage their own data" on public.users
     for all using (auth.uid() = id);

   create policy "Users can manage their own events" on public.personal_events
     for all using (auth.uid() = user_id);
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```

5. **Open in browser**: [http://localhost:3000](http://localhost:3000)

## 🎨 Key Components

### Landing Page
- Hero section with animated timeline preview
- Feature showcase with modern cards
- Statistics section
- Call-to-action sections

### Dashboard
- **Timeline View**: Interactive week grid with hover effects and detailed modals
- **Event Manager**: Full CRUD operations with filtering and sorting
- **Life Chapters**: AI-generated artwork for different life phases
- **AI Insights**: Pattern analysis and personalized recommendations

### Authentication
- Modern sign-in/sign-up forms with validation
- Password strength indicators
- Smooth animations and error handling

## 🤖 AI Features Deep Dive

### Sentiment Analysis
Uses Hugging Face's `cardiffnlp/twitter-roberta-base-sentiment-latest` model with fallback keyword analysis for reliability.

### Narrative Generation
Connects personal events with historical context using `microsoft/DialoGPT-medium` to create meaningful stories.

### Art Generation
Creates detailed prompts for AI art generation based on life events and themes.

### Insights Engine
Analyzes patterns in:
- Sentiment trends over time
- Life area focus (career, personal, etc.)
- Seasonal patterns
- Growth indicators

## 🔒 Security Features

- **Row Level Security (RLS)** in Supabase
- **Server-side validation** with Zod schemas
- **Protected API routes** with authentication checks
- **Input sanitization** and XSS protection
- **Environment variable protection**
- **CSRF protection** via Next.js

## 🎯 Hackathon Optimizations

### Stable Dependencies
- Uses proven, stable versions of all packages
- Excellent Windows compatibility
- Minimal setup requirements

### Demo-Ready Features
- Compelling landing page
- Smooth animations and transitions
- Real-time AI processing
- Interactive timeline visualization
- Professional UI/UX design

### Judge-Friendly Code
- Clean, well-documented codebase
- TypeScript for better code quality
- Modular component architecture
- Clear separation of concerns

## 📱 Responsive Design

- **Mobile-first** approach
- **Tablet-optimized** layouts
- **Desktop-enhanced** features
- **Touch-friendly** interactions

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-supabase-anon-key
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the "4,000 Weeks" concept by Oliver Burkeman
- Hugging Face for providing excellent AI models
- Supabase for the amazing backend-as-a-service platform
- The open-source community for the incredible tools and libraries

---

**Built with ❤️ for meaningful life reflection and personal growth.**
