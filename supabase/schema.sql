-- Real Estate SaaS Platform — Supabase Schema
-- Multi-tenant architecture with deal pipeline management

-- ============================================================
-- TENANTS (agencies)
-- ============================================================
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  domain text unique,
  logo_url text,
  plan text default 'free' check (plan in ('free', 'starter', 'pro', 'enterprise')),
  plan_status text default 'active' check (plan_status in ('active', 'trialing', 'past_due', 'canceled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  max_properties int default 10,
  max_team_members int default 2,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_tenants_slug on tenants(slug);
create index idx_tenants_domain on tenants(domain);

-- ============================================================
-- TENANT MEMBERS (users belonging to an agency)
-- ============================================================
create table tenant_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text default 'admin' check (role in ('owner', 'admin', 'agent')),
  created_at timestamptz default now(),
  unique(tenant_id, user_id)
);

create index idx_tenant_members_tenant on tenant_members(tenant_id);
create index idx_tenant_members_user on tenant_members(user_id);

-- ============================================================
-- SITE SETTINGS (one row per tenant)
-- ============================================================
create table site_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
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
  hero_title_nl text,
  hero_title_fr text,
  hero_title_en text,
  hero_subtitle_nl text,
  hero_subtitle_fr text,
  hero_subtitle_en text,
  hero_image_url text,
  years_active int default 0,
  properties_sold int default 0,
  happy_clients int default 0,
  team_members int default 0,
  google_rating numeric(2,1) default 0,
  valuation_rates jsonb default '{}',
  visible_sections jsonb default '["hero","properties","services","neighborhoods","about","testimonials","valuation","mortgage","blog"]',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id)
);

create index idx_site_settings_tenant on site_settings(tenant_id);

-- ============================================================
-- PROPERTIES
-- ============================================================
create table properties (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
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

create index idx_properties_tenant on properties(tenant_id);
create index idx_properties_type on properties(type);
create index idx_properties_category on properties(category);
create index idx_properties_city on properties(city);
create index idx_properties_status on properties(status);
create index idx_properties_price on properties(price);

-- ============================================================
-- NEIGHBORHOODS
-- ============================================================
create table neighborhoods (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
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

create index idx_neighborhoods_tenant on neighborhoods(tenant_id);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
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

create index idx_testimonials_tenant on testimonials(tenant_id);

-- ============================================================
-- BLOG POSTS
-- ============================================================
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  slug text not null,
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
  updated_at timestamptz default now(),
  unique(tenant_id, slug)
);

create index idx_blog_posts_tenant on blog_posts(tenant_id);
create index idx_blog_posts_slug on blog_posts(slug);
create index idx_blog_posts_status on blog_posts(status);

-- ============================================================
-- SERVICES
-- ============================================================
create table services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
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

create index idx_services_tenant on services(tenant_id);

-- ============================================================
-- LEADS
-- ============================================================
create table leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
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

create index idx_leads_tenant on leads(tenant_id);
create index idx_leads_type on leads(type);
create index idx_leads_status on leads(status);

-- ============================================================
-- VIEWINGS
-- ============================================================
create table viewings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
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

create index idx_viewings_tenant on viewings(tenant_id);
create index idx_viewings_property on viewings(property_id);
create index idx_viewings_status on viewings(status);

-- ============================================================
-- CHAT SESSIONS
-- ============================================================
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  visitor_name text,
  status text default 'active' check (status in ('active', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_chat_sessions_tenant on chat_sessions(tenant_id);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  sender text not null check (sender in ('visitor', 'agent')),
  message text not null,
  created_at timestamptz default now()
);

create index idx_chat_messages_session on chat_messages(session_id);

-- ============================================================
-- DEALS (real estate deal pipeline)
-- ============================================================
create table deals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null,
  client_name text,
  client_email text,
  client_phone text,
  deal_type text not null check (deal_type in ('sale', 'rental', 'acquisition')),
  stage text default 'lead' check (stage in (
    'lead', 'viewing', 'offer', 'negotiation', 'under_contract', 'closing', 'completed', 'lost'
  )),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  deal_value numeric default 0,
  commission_rate numeric(5,2) default 0,
  commission_amount numeric default 0,
  expected_close_date date,
  actual_close_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_deals_tenant on deals(tenant_id);
create index idx_deals_stage on deals(stage);
create index idx_deals_property on deals(property_id);
create index idx_deals_assigned on deals(assigned_to);

-- ============================================================
-- DEAL ACTIVITIES (timeline / log per deal)
-- ============================================================
create table deal_activities (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  activity_type text not null check (activity_type in (
    'note', 'call', 'email', 'meeting', 'viewing', 'offer', 'document', 'stage_change', 'system'
  )),
  title text not null,
  description text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index idx_deal_activities_deal on deal_activities(deal_id);

-- ============================================================
-- DEAL TASKS (checklists per deal)
-- ============================================================
create table deal_tasks (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null,
  due_date date,
  is_completed boolean default false,
  completed_at timestamptz,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index idx_deal_tasks_deal on deal_tasks(deal_id);

-- ============================================================
-- DEAL DOCUMENTS
-- ============================================================
create table deal_documents (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  name text not null,
  file_url text not null,
  file_type text,
  file_size int,
  category text default 'other' check (category in (
    'contract', 'inspection', 'appraisal', 'financial', 'legal', 'photo', 'other'
  )),
  created_at timestamptz default now()
);

create index idx_deal_documents_deal on deal_documents(deal_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Helper function: get tenant_ids for current user
create or replace function get_user_tenant_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select tenant_id from tenant_members where user_id = auth.uid();
$$;

-- Helper function: check if user belongs to tenant
create or replace function user_belongs_to_tenant(tid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists(select 1 from tenant_members where user_id = auth.uid() and tenant_id = tid);
$$;

-- Enable RLS on all tables
alter table tenants enable row level security;
alter table tenant_members enable row level security;
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
alter table deals enable row level security;
alter table deal_activities enable row level security;
alter table deal_tasks enable row level security;
alter table deal_documents enable row level security;

-- TENANTS: public read by slug/domain, members can update their own
create policy "Public read tenants" on tenants for select using (true);
create policy "Members update tenant" on tenants for update using (user_belongs_to_tenant(id));

-- TENANT MEMBERS: members see their own tenant's members
create policy "Members read own tenant" on tenant_members for select using (user_belongs_to_tenant(tenant_id));
create policy "Owner manage members" on tenant_members for all using (
  exists(select 1 from tenant_members tm where tm.user_id = auth.uid() and tm.tenant_id = tenant_members.tenant_id and tm.role = 'owner')
);
-- Allow insert during registration (service role handles this, but also for the creating user)
create policy "Self insert membership" on tenant_members for insert with check (user_id = auth.uid());

-- SITE SETTINGS: public read (for rendering tenant sites), tenant members can update
create policy "Public read site_settings" on site_settings for select using (true);
create policy "Members manage site_settings" on site_settings for all using (user_belongs_to_tenant(tenant_id));

-- PROPERTIES: public read active properties, tenant members manage
create policy "Public read properties" on properties for select using (status = 'active');
create policy "Members manage properties" on properties for all using (user_belongs_to_tenant(tenant_id));

-- NEIGHBORHOODS: public read, tenant members manage
create policy "Public read neighborhoods" on neighborhoods for select using (true);
create policy "Members manage neighborhoods" on neighborhoods for all using (user_belongs_to_tenant(tenant_id));

-- TESTIMONIALS: public read visible, tenant members manage
create policy "Public read testimonials" on testimonials for select using (is_visible = true);
create policy "Members manage testimonials" on testimonials for all using (user_belongs_to_tenant(tenant_id));

-- BLOG POSTS: public read published, tenant members manage
create policy "Public read blog_posts" on blog_posts for select using (status = 'published');
create policy "Members manage blog_posts" on blog_posts for all using (user_belongs_to_tenant(tenant_id));

-- SERVICES: public read, tenant members manage
create policy "Public read services" on services for select using (true);
create policy "Members manage services" on services for all using (user_belongs_to_tenant(tenant_id));

-- LEADS: public insert (with tenant_id), tenant members manage
create policy "Public insert leads" on leads for insert with check (true);
create policy "Members manage leads" on leads for all using (user_belongs_to_tenant(tenant_id));

-- VIEWINGS: public insert, tenant members manage
create policy "Public insert viewings" on viewings for insert with check (true);
create policy "Members manage viewings" on viewings for all using (user_belongs_to_tenant(tenant_id));

-- CHAT SESSIONS: public insert, tenant members manage
create policy "Public insert chat_sessions" on chat_sessions for insert with check (true);
create policy "Members manage chat_sessions" on chat_sessions for all using (user_belongs_to_tenant(tenant_id));

-- CHAT MESSAGES: public insert (visitor), public read, tenant members manage
create policy "Public insert chat_messages" on chat_messages for insert with check (sender = 'visitor');
create policy "Public read chat_messages" on chat_messages for select using (true);
create policy "Members manage chat_messages" on chat_messages for all using (
  exists(
    select 1 from chat_sessions cs
    where cs.id = chat_messages.session_id
    and user_belongs_to_tenant(cs.tenant_id)
  )
);

-- DEALS: only tenant members
create policy "Members manage deals" on deals for all using (user_belongs_to_tenant(tenant_id));

-- DEAL ACTIVITIES: only via deal's tenant
create policy "Members manage deal_activities" on deal_activities for all using (
  exists(select 1 from deals d where d.id = deal_activities.deal_id and user_belongs_to_tenant(d.tenant_id))
);

-- DEAL TASKS: only via deal's tenant
create policy "Members manage deal_tasks" on deal_tasks for all using (
  exists(select 1 from deals d where d.id = deal_tasks.deal_id and user_belongs_to_tenant(d.tenant_id))
);

-- DEAL DOCUMENTS: only via deal's tenant
create policy "Members manage deal_documents" on deal_documents for all using (
  exists(select 1 from deals d where d.id = deal_documents.deal_id and user_belongs_to_tenant(d.tenant_id))
);

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table deals;
alter publication supabase_realtime add table deal_activities;

-- ============================================================
-- STORAGE
-- ============================================================
insert into storage.buckets (id, name, public) values ('images', 'images', true);
create policy "Public read images" on storage.objects for select using (bucket_id = 'images');
create policy "Auth upload images" on storage.objects for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');
create policy "Auth delete images" on storage.objects for delete using (bucket_id = 'images' and auth.role() = 'authenticated');

insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
create policy "Auth read documents" on storage.objects for select using (bucket_id = 'documents' and auth.role() = 'authenticated');
create policy "Auth upload documents" on storage.objects for insert with check (bucket_id = 'documents' and auth.role() = 'authenticated');
create policy "Auth delete documents" on storage.objects for delete using (bucket_id = 'documents' and auth.role() = 'authenticated');
