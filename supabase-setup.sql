-- ============================================================
-- AI Career OS — Supabase Setup
-- Run this entire script in the Supabase SQL Editor.
-- It is safe to run multiple times (idempotent).
-- ============================================================


-- ── 1. TABLES ────────────────────────────────────────────────

create table if not exists roles (
  id uuid default gen_random_uuid() primary key,
  role_name text not null unique,
  description text
);

create table if not exists skills (
  id uuid default gen_random_uuid() primary key,
  skill_name text not null,
  category text,
  user_id uuid references auth.users(id) on delete cascade
);

-- Ensure user_id column exists for older databases
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='skills' and column_name='user_id') then
    alter table skills add column user_id uuid references auth.users(id) on delete cascade;
  end if;
end $$;

-- Drop old unique constraint if it exists and add new one
do $$
begin
  alter table skills drop constraint if exists skills_skill_name_key;
  if not exists (select 1 from pg_constraint where conname = 'skills_skill_name_user_id_key') then
    alter table skills add constraint skills_skill_name_user_id_key unique (skill_name, user_id);
  end if;
end $$;

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  college_name text,
  branch text,
  graduation_year int,
  current_year int,
  city text,
  github_url text,
  linkedin_url text,
  target_role_id uuid references roles(id),
  onboarded boolean default false,
  created_at timestamp default now()
);

create table if not exists planner_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category text default 'Technical',
  priority text default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  due_date date,
  completed boolean default false,
  created_at timestamp default now()
);

create table if not exists job_applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  company text not null,
  role text not null,
  status text default 'Saved' check (status in ('Saved','Applied','Interview','Offer','Rejected')),
  location text,
  deadline date,
  link text,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists habit_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null,
  habit_id text not null,
  done boolean default true,
  unique(user_id, log_date, habit_id)
);

create table if not exists user_skills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  skill_id uuid references skills(id) on delete cascade not null,
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  updated_at timestamp default now(),
  unique(user_id, skill_id)
);

create table if not exists resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  file_url text,
  extracted_text text,
  ats_score int,
  ai_feedback text,
  uploaded_at timestamp default now()
);


-- ── 2. SEED DATA ─────────────────────────────────────────────

insert into roles (role_name, description)
select seed.role_name, seed.description
from (
  values
    ('Frontend Developer',  'Builds user interfaces using HTML, CSS, JavaScript and React'),
    ('Backend Developer',   'Builds servers, APIs and database-backed systems'),
    ('Full Stack Developer','Builds frontend and backend features end to end'),
    ('Data Analyst',        'Analyzes data using SQL, Python and visualization tools'),
    ('Java Developer',      'Builds applications using Java and backend frameworks'),
    ('Salesforce Developer','Builds CRM solutions on the Salesforce platform')
) as seed(role_name, description)
where not exists (
  select 1 from roles where roles.role_name = seed.role_name
);

insert into skills (skill_name, category)
select seed.skill_name, seed.category
from (
  values
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🎨 FRONTEND
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    ('HTML',              'Frontend'),
    ('CSS',               'Frontend'),
    ('JavaScript',        'Frontend'),
    ('TypeScript',        'Frontend'),
    ('React',             'Frontend'),
    ('Next.js',           'Frontend'),
    ('Vue.js',            'Frontend'),
    ('Angular',           'Frontend'),
    ('Svelte',            'Frontend'),
    ('Tailwind CSS',      'Frontend'),
    ('Bootstrap',         'Frontend'),
    ('SASS / SCSS',       'Frontend'),
    ('Redux',             'Frontend'),
    ('React Query',       'Frontend'),
    ('Zustand',           'Frontend'),
    ('Vite',              'Frontend'),
    ('Webpack',           'Frontend'),
    ('Three.js',          'Frontend'),

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- ⚙️ BACKEND
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    ('Node.js',           'Backend'),
    ('Express.js',        'Backend'),
    ('FastAPI',           'Backend'),
    ('Django',            'Backend'),
    ('Flask',             'Backend'),
    ('Spring Boot',       'Backend'),
    ('NestJS',            'Backend'),
    ('GraphQL',           'Backend'),
    ('REST APIs',         'Backend'),
    ('WebSockets',        'Backend'),
    ('gRPC',              'Backend'),
    ('Microservices',     'Backend'),
    ('Message Queues',    'Backend'),
    ('Redis',             'Backend'),
    ('Nginx',             'Backend'),

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 📱 MOBILE
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    ('React Native',      'Mobile'),
    ('Flutter',           'Mobile'),
    ('Android (Kotlin)',   'Mobile'),
    ('Android (Java)',     'Mobile'),
    ('iOS (Swift)',        'Mobile'),
    ('Expo',              'Mobile'),

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🗄️ DATABASE
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    ('SQL',               'Database'),
    ('PostgreSQL',        'Database'),
    ('MySQL',             'Database'),
    ('MongoDB',           'Database'),
    ('Firebase',          'Database'),
    ('Supabase',          'Database'),
    ('SQLite',            'Database'),
    ('Prisma',            'Database'),
    ('Mongoose',          'Database'),
    ('DynamoDB',          'Database'),
    ('Cassandra',         'Database'),
    ('DBMS',              'Database'),

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🚀 DEVOPS & CLOUD
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    ('Docker',            'DevOps'),
    ('Kubernetes',        'DevOps'),
    ('CI/CD',             'DevOps'),
    ('GitHub Actions',    'DevOps'),
    ('Jenkins',           'DevOps'),
    ('Terraform',         'DevOps'),
    ('Linux',             'DevOps'),
    ('Bash Scripting',    'DevOps'),
    ('AWS',               'Cloud'),
    ('Google Cloud',      'Cloud'),
    ('Azure',             'Cloud'),
    ('Vercel',            'Cloud'),
    ('Netlify',           'Cloud'),

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 💻 PROGRAMMING LANGUAGES
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    ('Python',            'Language'),
    ('Java',              'Language'),
    ('C',                 'Language'),
    ('C++',               'Language'),
    ('C#',                'Language'),
    ('Go (Golang)',        'Language'),
    ('Rust',              'Language'),
    ('Kotlin',            'Language'),
    ('Swift',             'Language'),
    ('PHP',               'Language'),
    ('Ruby',              'Language'),
    ('Scala',             'Language'),
    ('R',                 'Language'),
    ('MATLAB',            'Language'),

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 📐 CORE CS SUBJECTS
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    ('DSA',               'Core CS'),
    ('Algorithms',        'Core CS'),
    ('Data Structures',   'Core CS'),
    ('OS (Operating Systems)', 'Core CS'),
    ('Computer Networks', 'Core CS'),
    ('OOP Concepts',      'Core CS'),
    ('System Design',     'Core CS'),
    ('Aptitude',          'Core CS'),
    ('Competitive Programming', 'Core CS'),

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🤖 DATA SCIENCE & AI
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    ('Machine Learning',  'Data Science'),
    ('Deep Learning',     'Data Science'),
    ('Data Analysis',     'Data Science'),
    ('Pandas',            'Data Science'),
    ('NumPy',             'Data Science'),
    ('Scikit-learn',      'Data Science'),
    ('TensorFlow',        'Data Science'),
    ('PyTorch',           'Data Science'),
    ('NLP',               'Data Science'),
    ('Power BI',          'Data Science'),
    ('Tableau',           'Data Science'),
    ('Generative AI',     'Data Science'),
    ('Prompt Engineering','Data Science'),
    ('LangChain',         'Data Science'),

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🎨 DESIGN & UX
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    ('Figma',             'Design'),
    ('Adobe XD',          'Design'),
    ('Canva',             'Design'),
    ('UI/UX Design',      'Design'),
    ('Wireframing',       'Design'),
    ('Prototyping',       'Design'),

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🛠️ TOOLS & TESTING
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    ('Git',               'Tools'),
    ('GitHub',            'Tools'),
    ('Postman',           'Tools'),
    ('VS Code',           'Tools'),
    ('IntelliJ IDEA',     'Tools'),
    ('Jira',              'Tools'),
    ('Notion',            'Tools'),
    ('Selenium',          'Tools'),
    ('Jest',              'Tools'),
    ('Cypress',           'Tools'),

    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    -- 🗣️ SOFT SKILLS
    -- ━━━━━━━━━━━━━━━━━━━━━━━━━━
    ('Communication',     'Soft Skills'),
    ('Problem Solving',   'Soft Skills'),
    ('Teamwork',          'Soft Skills'),
    ('Leadership',        'Soft Skills'),
    ('Time Management',   'Soft Skills'),
    ('Critical Thinking', 'Soft Skills'),
    ('Adaptability',      'Soft Skills'),
    ('Public Speaking',   'Soft Skills'),
    ('Resume Writing',    'Soft Skills'),
    ('Networking',        'Soft Skills')

) as seed(skill_name, category)
where not exists (
  select 1 from skills where skills.skill_name = seed.skill_name and skills.user_id is null
);


-- ── 3. ENABLE ROW LEVEL SECURITY ─────────────────────────────

alter table roles             enable row level security;
alter table skills            enable row level security;
alter table profiles          enable row level security;
alter table user_skills       enable row level security;
alter table resumes           enable row level security;
alter table planner_tasks     enable row level security;
alter table job_applications  enable row level security;
alter table habit_log         enable row level security;


-- ── 4. DROP OLD POLICIES (safe cleanup) ──────────────────────

drop policy if exists "Public roles read"            on roles;
drop policy if exists "Public skills read"           on skills;

drop policy if exists "Users can read own profile"   on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can upsert own profile" on profiles;

drop policy if exists "Users can read own skills"    on user_skills;
drop policy if exists "Users can insert own skills"  on user_skills;
drop policy if exists "Users can update own skills"  on user_skills;
drop policy if exists "Users can upsert own skills"  on user_skills;
drop policy if exists "Users can delete own skills"  on user_skills;
drop policy if exists "Authenticated users can insert skills" on skills;
drop policy if exists "Users can read global or own skills" on skills;
drop policy if exists "Users can insert own skills" on skills;
drop policy if exists "Users can update own skills" on skills;
drop policy if exists "Users can delete own skills" on skills;

drop policy if exists "Users can read own resumes"   on resumes;
drop policy if exists "Users can insert own resumes" on resumes;

drop policy if exists "Users can read own tasks"    on planner_tasks;
drop policy if exists "Users can insert own tasks"  on planner_tasks;
drop policy if exists "Users can update own tasks"  on planner_tasks;
drop policy if exists "Users can delete own tasks"  on planner_tasks;

drop policy if exists "Users can read own applications"   on job_applications;
drop policy if exists "Users can insert own applications" on job_applications;
drop policy if exists "Users can update own applications" on job_applications;
drop policy if exists "Users can delete own applications" on job_applications;

drop policy if exists "Users can read own habit_log"   on habit_log;
drop policy if exists "Users can insert own habit_log" on habit_log;
drop policy if exists "Users can update own habit_log" on habit_log;
drop policy if exists "Users can delete own habit_log" on habit_log;


-- ── 5. POLICIES: roles & skills (public read) ────────────────

create policy "Public roles read"
  on roles for select
  using (true);

create policy "Users can read global or own skills"
  on skills for select
  using (user_id is null or auth.uid() = user_id);

create policy "Users can insert own skills"
  on skills for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own skills"
  on skills for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own skills"
  on skills for delete
  using (auth.uid() = user_id);


-- ── 6. POLICIES: profiles ────────────────────────────────────

-- SELECT
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- INSERT  (needed for first-time save / upsert)
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- UPDATE  (needed for subsequent saves / upsert)
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ── 7. POLICIES: user_skills ─────────────────────────────────

-- SELECT
create policy "Users can read own skills"
  on user_skills for select
  using (auth.uid() = user_id);

-- INSERT  (needed for first-time save / upsert)
create policy "Users can insert own skills"
  on user_skills for insert
  with check (auth.uid() = user_id);

-- UPDATE  (needed for subsequent saves / upsert)
create policy "Users can update own skills"
  on user_skills for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE
create policy "Users can delete own skills"
  on user_skills for delete
  using (auth.uid() = user_id);


-- ── 8. POLICIES: resumes ─────────────────────────────────────

-- SELECT
create policy "Users can read own resumes"
  on resumes for select
  using (auth.uid() = user_id);

-- INSERT
create policy "Users can insert own resumes"
  on resumes for insert
  with check (auth.uid() = user_id);


-- ── 9. POLICIES: planner_tasks ───────────────────────────────

create policy "Users can read own tasks"
  on planner_tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks"
  on planner_tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks"
  on planner_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own tasks"
  on planner_tasks for delete using (auth.uid() = user_id);


-- ── 10. POLICIES: job_applications ──────────────────────────

create policy "Users can read own applications"
  on job_applications for select using (auth.uid() = user_id);
create policy "Users can insert own applications"
  on job_applications for insert with check (auth.uid() = user_id);
create policy "Users can update own applications"
  on job_applications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own applications"
  on job_applications for delete using (auth.uid() = user_id);


-- ── 11. POLICIES: habit_log ──────────────────────────────────

create policy "Users can read own habit_log"
  on habit_log for select using (auth.uid() = user_id);
create policy "Users can insert own habit_log"
  on habit_log for insert with check (auth.uid() = user_id);
create policy "Users can update own habit_log"
  on habit_log for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own habit_log"
  on habit_log for delete using (auth.uid() = user_id);


-- ── 9. STORAGE BUCKET: resumes ───────────────────────────────

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Drop old storage policies first
drop policy if exists "Resume upload for owner"  on storage.objects;
drop policy if exists "Resume read for owner"    on storage.objects;
drop policy if exists "Resume delete for owner"  on storage.objects;

-- Allow authenticated users to upload to their own folder
create policy "Resume upload for owner"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own files
create policy "Resume read for owner"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own files
create policy "Resume delete for owner"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ── 12. ADDITIONAL MODULE TABLES ──────────────────────────────

create table if not exists career_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  target_date date,
  category text,
  priority text,
  progress int default 0,
  completed boolean default false,
  sub_goals jsonb default '[]'::jsonb,
  created_at timestamp default now()
);

create table if not exists career_journal (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  text text not null,
  mood text not null,
  tags text[] default array[]::text[],
  created_at timestamp default now()
);

create table if not exists pomodoro_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  session_date date not null,
  sessions_completed int default 0,
  minutes_focused int default 0,
  unique(user_id, session_date)
);

create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  role text not null,
  content text not null,
  created_at timestamp default now()
);

create table if not exists interview_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  role text,
  score int,
  session_type text check (session_type in ('technical', 'mock', 'hr', 'gd')),
  difficulty text,
  pacing_wpm int,
  filler_count int,
  total_questions int,
  answered_count int,
  created_at timestamp default now()
);

create table if not exists completed_skill_nodes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  node_id int not null,
  completed_at timestamp default now(),
  unique(user_id, node_id)
);

create table if not exists test_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  score int not null,
  correct_count int not null,
  total_questions int not null,
  cheat_warnings int not null,
  submitted_at timestamp default now()
);


-- ── 13. ADDITIONAL MODULE POLICIES ────────────────────────────

alter table career_goals enable row level security;
alter table career_journal enable row level security;
alter table pomodoro_sessions enable row level security;
alter table chat_messages enable row level security;
alter table interview_sessions enable row level security;
alter table completed_skill_nodes enable row level security;
alter table test_submissions enable row level security;

-- career_goals policies
drop policy if exists "Users can manage own goals" on career_goals;
create policy "Users can manage own goals" on career_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- career_journal policies
drop policy if exists "Users can manage own journal" on career_journal;
create policy "Users can manage own journal" on career_journal
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- pomodoro_sessions policies
drop policy if exists "Users can manage own pomodoro_sessions" on pomodoro_sessions;
create policy "Users can manage own pomodoro_sessions" on pomodoro_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- chat_messages policies
drop policy if exists "Users can manage own chat_messages" on chat_messages;
create policy "Users can manage own chat_messages" on chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- interview_sessions policies
drop policy if exists "Users can manage own interview_sessions" on interview_sessions;
create policy "Users can manage own interview_sessions" on interview_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- completed_skill_nodes policies
drop policy if exists "Users can manage own completed_skill_nodes" on completed_skill_nodes;
create policy "Users can manage own completed_skill_nodes" on completed_skill_nodes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- test_submissions policies
drop policy if exists "Users can manage own test_submissions" on test_submissions;
create policy "Users can manage own test_submissions" on test_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

