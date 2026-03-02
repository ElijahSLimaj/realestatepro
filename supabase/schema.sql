-- Real Estate Template — Supabase Schema

-- Site Settings (single row)
create table site_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  tagline text,
  phone text,
  email text,
  address text,
  kvk text,
  btw text,
  default_lang text default 'nl',
  primary_color text default '#0C1D2E',
  accent_color text default '#C8944A',
  logo_url text,
  years_active int default 0,
  properties_sold int default 0,
  happy_clients int default 0,
  team_members int default 0,
  google_rating numeric(2,1) default 0,
  valuation_rates jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Properties
create table properties (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('sale', 'rent')),
  category text not null check (category in ('apartment', 'house', 'villa', 'penthouse')),
  status text default 'active' check (status in ('active', 'sold', 'rented', 'draft')),
  is_featured boolean default false,
  is_new boolean default false,
  price numeric not null,
  address text,
  city text,
  postcode text,
  beds int default 0,
  baths int default 0,
  area int default 0,
  year_built int,
  title_nl text,
  title_fr text,
  title_en text,
  description_nl text,
  description_fr text,
  description_en text,
  images jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Neighborhoods
create table neighborhoods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  avg_price numeric default 0,
  listing_count int default 0,
  sort_order int default 0,
  description_nl text,
  description_fr text,
  description_en text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Testimonials
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  rating int default 5 check (rating between 1 and 5),
  property_type_nl text,
  property_type_fr text,
  property_type_en text,
  text_nl text,
  text_fr text,
  text_en text,
  is_visible boolean default true,
  created_at timestamptz default now()
);

-- Blog Posts
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  status text default 'draft' check (status in ('draft', 'published')),
  image_url text,
  read_time int default 5,
  title_nl text,
  title_fr text,
  title_en text,
  excerpt_nl text,
  excerpt_fr text,
  excerpt_en text,
  content_nl text,
  content_fr text,
  content_en text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Services
create table services (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  icon_name text,
  sort_order int default 0,
  title_nl text,
  title_fr text,
  title_en text,
  description_nl text,
  description_fr text,
  description_en text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leads (valuation, mortgage, contact submissions)
create table leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('valuation', 'mortgage', 'contact')),
  name text,
  email text,
  phone text,
  data jsonb default '{}',
  status text default 'new' check (status in ('new', 'contacted', 'closed')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Viewings (scheduled visits)
create table viewings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  preferred_date date not null,
  preferred_time text not null,
  message text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat Sessions
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_name text,
  status text default 'active' check (status in ('active', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat Messages
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  sender text not null check (sender in ('visitor', 'agent')),
  message text not null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_properties_type on properties(type);
create index idx_properties_category on properties(category);
create index idx_properties_city on properties(city);
create index idx_properties_status on properties(status);
create index idx_properties_price on properties(price);
create index idx_blog_posts_slug on blog_posts(slug);
create index idx_blog_posts_status on blog_posts(status);
create index idx_leads_type on leads(type);
create index idx_leads_status on leads(status);
create index idx_viewings_property on viewings(property_id);
create index idx_viewings_status on viewings(status);
create index idx_chat_messages_session on chat_messages(session_id);

-- RLS Policies
alter table site_settings enable row level security;
alter table properties enable row level security;
alter table neighborhoods enable row level security;
alter table testimonials enable row level security;
alter table blog_posts enable row level security;
alter table services enable row level security;
alter table leads enable row level security;
alter table viewings enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;

-- Public read for content tables
create policy "Public read site_settings" on site_settings for select using (true);
create policy "Public read properties" on properties for select using (status = 'active');
create policy "Public read neighborhoods" on neighborhoods for select using (true);
create policy "Public read testimonials" on testimonials for select using (is_visible = true);
create policy "Public read blog_posts" on blog_posts for select using (status = 'published');
create policy "Public read services" on services for select using (true);

-- Public insert for viewings
create policy "Public insert viewings" on viewings for insert with check (true);

-- Public insert for leads and chat
create policy "Public insert leads" on leads for insert with check (true);
create policy "Public insert chat_sessions" on chat_sessions for insert with check (true);
create policy "Public insert chat_messages" on chat_messages for insert with check (sender = 'visitor');
create policy "Public read own chat_messages" on chat_messages for select using (true);

-- Authenticated (admin) full access
create policy "Admin full site_settings" on site_settings for all using (auth.role() = 'authenticated');
create policy "Admin full properties" on properties for all using (auth.role() = 'authenticated');
create policy "Admin full neighborhoods" on neighborhoods for all using (auth.role() = 'authenticated');
create policy "Admin full testimonials" on testimonials for all using (auth.role() = 'authenticated');
create policy "Admin full blog_posts" on blog_posts for all using (auth.role() = 'authenticated');
create policy "Admin full services" on services for all using (auth.role() = 'authenticated');
create policy "Admin full leads" on leads for all using (auth.role() = 'authenticated');
create policy "Admin full viewings" on viewings for all using (auth.role() = 'authenticated');
create policy "Admin full chat_sessions" on chat_sessions for all using (auth.role() = 'authenticated');
create policy "Admin full chat_messages" on chat_messages for all using (auth.role() = 'authenticated');

-- Enable realtime for chat
alter publication supabase_realtime add table chat_messages;

-- Storage bucket
insert into storage.buckets (id, name, public) values ('images', 'images', true);
create policy "Public read images" on storage.objects for select using (bucket_id = 'images');
create policy "Auth upload images" on storage.objects for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');
create policy "Auth delete images" on storage.objects for delete using (bucket_id = 'images' and auth.role() = 'authenticated');
