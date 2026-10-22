-- Brand Hub: suggested schema for the real backend (see HANDOVER.md).
-- Not used by the UI prototype, which runs on local mock data.

-- ---------------------------------------------------------------------------
-- Access control
-- ---------------------------------------------------------------------------

-- Only Google accounts on these domains can sign in.
create table public.allowed_domains (
  domain text primary key
);

insert into public.allowed_domains (domain) values ('cubehq.ai');

create type public.user_role as enum ('admin', 'editor', 'viewer');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'viewer',
  created_at timestamptz not null default now()
);

-- Create a profile for each new sign-in, and reject emails outside the
-- allowed domains. Raising here aborts the sign-up, so outsiders never get
-- an auth user at all. The first person to sign in becomes admin.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  email_domain text := lower(split_part(new.email, '@', 2));
  is_first boolean;
begin
  if not exists (select 1 from public.allowed_domains where domain = email_domain) then
    raise exception 'Email domain % is not allowed', email_domain;
  end if;

  select not exists (select 1 from public.profiles) into is_first;

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    case when is_first then 'admin'::public.user_role else 'viewer'::public.user_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role of the signed-in user, or null if they have no profile.
create function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.can_edit()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_user_role() in ('admin', 'editor'), false);
$$;

-- ---------------------------------------------------------------------------
-- Clients and their brand data
-- ---------------------------------------------------------------------------

create type public.client_status as enum ('active', 'paused', 'archived');

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  tagline text,
  industry text,
  website text,
  description text,
  tone_of_voice text,
  brand_color text,
  status public.client_status not null default 'active',
  start_date date,
  services text[] not null default '{}',
  tags text[] not null default '{}',
  socials jsonb not null default '{}',
  dos text,
  donts text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brand_colors (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text,
  hex text not null,
  usage text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.brand_fonts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  weights text,
  usage text,
  file_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  title text not null,
  url text not null,
  category text not null default 'other',
  note text,
  pinned boolean not null default false,
  position int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  body text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index on public.brand_colors (client_id);
create index on public.brand_fonts (client_id);
create index on public.links (client_id);
create index on public.notes (client_id);

-- Touch the parent client whenever it or its children change, so the
-- dashboard can show "updated 2 days ago".
create function public.touch_client()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'clients' then
    new.updated_at := now();
    return new;
  end if;
  update public.clients set updated_at = now()
  where id = coalesce(new.client_id, old.client_id);
  return coalesce(new, old);
end;
$$;

create trigger clients_touch before update on public.clients
  for each row execute function public.touch_client();
create trigger brand_colors_touch after insert or update or delete on public.brand_colors
  for each row execute function public.touch_client();
create trigger brand_fonts_touch after insert or update or delete on public.brand_fonts
  for each row execute function public.touch_client();
create trigger links_touch after insert or update or delete on public.links
  for each row execute function public.touch_client();
create trigger notes_touch after insert or update or delete on public.notes
  for each row execute function public.touch_client();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.allowed_domains enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.brand_colors enable row level security;
alter table public.brand_fonts enable row level security;
alter table public.links enable row level security;
alter table public.notes enable row level security;

-- allowed_domains: admins only
create policy "admins read domains" on public.allowed_domains
  for select to authenticated using (public.current_user_role() = 'admin');
create policy "admins write domains" on public.allowed_domains
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- profiles: every member can see the team; only admins change roles
create policy "members read profiles" on public.profiles
  for select to authenticated using (public.current_user_role() is not null);
create policy "admins update profiles" on public.profiles
  for update to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- clients: members read, editors write, only admins hard-delete
create policy "members read clients" on public.clients
  for select to authenticated using (public.current_user_role() is not null);
create policy "editors insert clients" on public.clients
  for insert to authenticated with check (public.can_edit());
create policy "editors update clients" on public.clients
  for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "admins delete clients" on public.clients
  for delete to authenticated using (public.current_user_role() = 'admin');

-- child tables: members read, editors write
do $$
declare
  t text;
begin
  foreach t in array array['brand_colors', 'brand_fonts', 'links', 'notes'] loop
    execute format(
      'create policy "members read %1$s" on public.%1$I
         for select to authenticated using (public.current_user_role() is not null)', t);
    execute format(
      'create policy "editors write %1$s" on public.%1$I
         for all to authenticated using (public.can_edit()) with check (public.can_edit())', t);
  end loop;
end;
$$;
