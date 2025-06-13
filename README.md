# Life in Weeks Timeline

An AI-powered interactive timeline application that visualizes your life week by week, combining personal milestones with significant world events. The application uses AI to create personal narratives, analyze sentiment, and generate art for different life chapters.

## Features

- Visualize your life week by week
- Add and manage personal events
- AI-generated narratives connecting personal and historical events
- Sentiment analysis for personal events
- AI-generated art for life chapters
- Secure authentication with Supabase
- Responsive and modern UI with Tailwind CSS

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase (Auth & Database)
- OpenAI GPT-4
- Tailwind CSS
- Framer Motion
- Zod (Schema Validation)

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd timeline
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENAI_API_KEY=your-openai-api-key
   ```

4. Set up your Supabase database:
   - Create a new project in Supabase
   - Enable Email Auth in Authentication settings
   - Create the following tables:

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
     category text,
     sentiment text,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Enable Row Level Security
   alter table public.users enable row level security;
   alter table public.personal_events enable row level security;

   -- Create policies
   create policy "Users can view their own data"
     on public.users for select
     using (auth.uid() = id);

   create policy "Users can update their own data"
     on public.users for update
     using (auth.uid() = id);

   create policy "Users can view their own events"
     on public.personal_events for select
     using (auth.uid() = user_id);

   create policy "Users can insert their own events"
     on public.personal_events for insert
     with check (auth.uid() = user_id);

   create policy "Users can update their own events"
     on public.personal_events for update
     using (auth.uid() = user_id);

   create policy "Users can delete their own events"
     on public.personal_events for delete
     using (auth.uid() = user_id);
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Security Features

- Row Level Security (RLS) in Supabase
- Server-side validation with Zod
- Protected API routes
- Secure authentication flow
- Environment variable protection
- Input sanitization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 