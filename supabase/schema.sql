-- =====================================================================
--  PORTFOLIO MENUISIER — Schéma Supabase
--  À exécuter une seule fois dans : Supabase > SQL Editor > New query
--
--  Sécurité :
--   • Tout le monde peut LIRE ce qui est visible (visible = true)
--   • Seuls les comptes listés dans la table « admins » peuvent ÉCRIRE
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
--  Administrateurs autorisés (emails)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- Aucune politique : la table n'est lisible/modifiable que depuis le tableau de bord Supabase.

-- Vrai si l'utilisateur connecté est un administrateur
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Mise à jour automatique de updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
--  Réglages de l'atelier (une seule ligne, id = 1)
--  Le champ data contient les valeurs qui remplacent celles de src/config.js
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  Créations / réalisations
--  photos : tableau JSON [{ "src": "...1600px.webp", "thumb": "...640px.webp" }, ...]
-- ---------------------------------------------------------------------
create table if not exists public.creations (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null check (char_length(title) between 1 and 80),
  category    text not null default 'autres',
  price       integer check (price is null or price >= 0),
  on_quote    boolean not null default false,
  description text not null default '' check (char_length(description) <= 200),
  badge       text not null default '',
  dimensions  text,
  wood        text,
  lead_time   text,
  photos      jsonb not null default '[]'::jsonb,
  visible     boolean not null default true,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists creations_order_idx on public.creations (visible, position);

-- ---------------------------------------------------------------------
--  Services
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 60),
  icon        text not null default 'ruler',
  price_from  integer not null default 0 check (price_from >= 0),
  description text not null default '' check (char_length(description) <= 200),
  visible     boolean not null default true,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  Témoignages
-- ---------------------------------------------------------------------
create table if not exists public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 40),
  district   text not null default '',
  rating     smallint not null default 5 check (rating between 1 and 5),
  text       text not null check (char_length(text) <= 300),
  photos     jsonb not null default '[]'::jsonb,
  visible    boolean not null default true,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  Avant / Après
-- ---------------------------------------------------------------------
create table if not exists public.before_after (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) between 1 and 80),
  "before"   jsonb not null default '[]'::jsonb,
  "after"    jsonb not null default '[]'::jsonb,
  visible    boolean not null default true,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Déclencheurs updated_at
do $$
declare t text;
begin
  foreach t in array array['settings', 'creations', 'services', 'testimonials', 'before_after'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- =====================================================================
--  RÈGLES DE SÉCURITÉ (Row Level Security)
-- =====================================================================
alter table public.settings     enable row level security;
alter table public.creations    enable row level security;
alter table public.services     enable row level security;
alter table public.testimonials enable row level security;
alter table public.before_after enable row level security;

-- Réglages : lecture publique, écriture admin
drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings for select using (true);
drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Listes : le public ne voit que les éléments visibles, l'admin voit et modifie tout
do $$
declare t text;
begin
  foreach t in array array['creations', 'services', 'testimonials', 'before_after'] loop
    execute format('drop policy if exists "%1$s_public_read" on public.%1$s', t);
    execute format('create policy "%1$s_public_read" on public.%1$s for select using (visible = true or public.is_admin())', t);
    execute format('drop policy if exists "%1$s_admin_write" on public.%1$s', t);
    execute format('create policy "%1$s_admin_write" on public.%1$s for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- =====================================================================
--  STOCKAGE DES PHOTOS (bucket public « media »)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'];

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- Ligne de réglages vide (les valeurs de src/config.js s'appliquent tant qu'elle est vide)
insert into public.settings (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;

-- =====================================================================
--  DERNIÈRE ÉTAPE : autorisez votre compte administrateur
--  (créez d'abord l'utilisateur dans Authentication > Users > Add user)
-- =====================================================================
-- insert into public.admins (email) values ('votre-email@exemple.com');
