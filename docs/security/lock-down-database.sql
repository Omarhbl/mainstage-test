-- Mainstage: run as the database owner in the project's Supabase SQL editor.
-- No application records are deleted. Existing policies are retained.
-- Public website content is served through server-side service-role queries.
begin;

alter table public.site_settings enable row level security;
revoke all privileges on table public.site_settings from public, anon, authenticated;
grant select, insert, update, delete on table public.site_settings to service_role;

alter table public.backoffice_articles enable row level security;
revoke all privileges on table public.backoffice_articles from public, anon, authenticated;
grant select, insert, update, delete on table public.backoffice_articles to service_role;

-- Team members may read only their own profile. All changes to roles/names are
-- performed by the protected server actions using service_role.
alter table public.profiles enable row level security;
revoke all privileges on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_settings' and policyname = 'mainstage_settings_server_only') then
    execute 'create policy mainstage_settings_server_only on public.site_settings as restrictive for all to anon, authenticated using (false) with check (false)';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'backoffice_articles' and policyname = 'mainstage_articles_server_only') then
    execute 'create policy mainstage_articles_server_only on public.backoffice_articles as restrictive for all to anon, authenticated using (false) with check (false)';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'mainstage_own_profile_only') then
    execute 'create policy mainstage_own_profile_only on public.profiles as restrictive for select to authenticated using (id = (select auth.uid()))';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'mainstage_read_own_profile') then
    execute 'create policy mainstage_read_own_profile on public.profiles for select to authenticated using (id = (select auth.uid()))';
  end if;
end $$;

-- Restrictive policy prevents existing broad upload policies from admitting
-- direct browser writes/listing for media-assets. Public image delivery remains
-- available via the bucket's existing public URL handler.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'mainstage_media_server_only') then
    execute 'create policy mainstage_media_server_only on storage.objects as restrictive for all to anon, authenticated using (bucket_id <> ''media-assets'') with check (bucket_id <> ''media-assets'')';
  end if;
end $$;

commit;

-- Configuration checks only; no private records returned.
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('profiles', 'site_settings', 'backoffice_articles')
  and grantee in ('anon', 'authenticated', 'PUBLIC', 'service_role')
order by table_name, grantee, privilege_type;
