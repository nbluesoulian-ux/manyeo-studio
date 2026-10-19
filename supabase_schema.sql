-- ========================================================
-- Manyeo Studio: Works / Projects Supabase Schema & Seed
-- ========================================================

-- 1. Create table
create table if not exists public.works (
  id text primary key,
  slug text unique not null,
  title text not null,
  tags text not null default '',
  href text not null default '',
  image_url text default '',
  depth_image_url text default '',
  color_bg text default '#111111',
  color_text text default '#ffffff',
  color_shadow numeric default 0.9,
  sort_order integer default 0,
  description text default '',
  gallery text default '',
  live_url text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.works enable row level security;

-- 3. Create policies (allowing read, insert, update, delete for public / anon key)
drop policy if exists "Allow public read" on public.works;
create policy "Allow public read" on public.works for select using (true);

drop policy if exists "Allow anon insert" on public.works;
create policy "Allow anon insert" on public.works for insert with check (true);

drop policy if exists "Allow anon update" on public.works;
create policy "Allow anon update" on public.works for update using (true);

drop policy if exists "Allow anon delete" on public.works;
create policy "Allow anon delete" on public.works for delete using (true);

-- 4. Seed initial 19 projects
insert into public.works (id, slug, title, tags, href, image_url, depth_image_url, color_bg, color_text, color_shadow, sort_order)
values
  ('oryzo_ai', 'oryzo_ai', 'Oryzo AI', 'concept • web • design • development • 3d • animation', '/projects/oryzo_ai', '/assets/projects/oryzo_ai/home.webp', '/assets/projects/oryzo_ai/home_depth.webp', '#1a1411', '#ffedd7', 0.9, 1),
  ('atlas_motion', 'atlas_motion', 'Atlas Motion', 'concept • web • design • development • 3d • animation', '/projects/atlas_motion', '/assets/projects/atlas_motion/home.webp', '/assets/projects/atlas_motion/home_depth.webp', '#181818', '#FFFDE0', 0.95, 2),
  ('devin_ai', 'devin_ai', 'Devin AI', 'web • design • development • 3d', '/projects/devin_ai', '/assets/projects/devin_ai/home.webp', '/assets/projects/devin_ai/home_depth.webp', '#121414', '#ffffff', 0.9, 3),
  ('of_the_oak', 'of_the_oak', 'Of The Oak', 'web • design • development • 3d • animation', '/projects/of_the_oak', '/assets/projects/of_the_oak/home.webp', '/assets/projects/of_the_oak/home_depth.webp', '#111a13', '#d9f3de', 0.9, 4),
  ('everswap', 'everswap', 'Everswap', 'concept • web • design • development • 3d • animation', '/projects/everswap', '/assets/projects/everswap/home.webp', '/assets/projects/everswap/home_depth.webp', '#E3E3F8', '#000', 0.95, 5),
  ('porsche_dream_machine', 'porsche_dream_machine', 'Porsche: Dream Machine', 'concept • 3D illustration • mograph • video', '/projects/porsche_dream_machine', '/assets/projects/porsche_dream_machine/home.webp', '/assets/projects/porsche_dream_machine/home_depth.webp', '#EFD5D3', '#000000', 0.95, 6),
  ('synthetic_human', 'synthetic_human', 'Synthetic Human', 'web • design • development • 3d', '/projects/synthetic_human', '/assets/projects/synthetic_human/home.webp', '/assets/projects/synthetic_human/home_depth.webp', '#9d8aff', '#ffffff', 0.95, 7),
  ('ddd_2024', 'ddd_2024', 'DDD 2024', 'web • design • development • 3d', '/projects/ddd_2024', '/assets/projects/ddd_2024/home.webp', '/assets/projects/ddd_2024/home_depth.webp', '#261c46', '#ffffff', 0.95, 8),
  ('spaace', 'spaace', 'Spaace - NFT Marketplace', 'web • design • development • 3d • web3', '/projects/spaace', '/assets/projects/spaace/home.webp', '/assets/projects/spaace/home_depth.webp', '#010a16', '#ffece2', 0.85, 9),
  ('choo_choo_world', 'choo_choo_world', 'Choo Choo World', 'concept • web • game design • 3d', '/projects/choo_choo_world', '/assets/projects/choo_choo_world/home.webp', '/assets/projects/choo_choo_world/home_depth.webp', '#E8EEF8', '#000000', 0.95, 10),
  ('zero_tech', 'zero_tech', 'Zero Tech', 'web • design • development • 3d', '/projects/zero_tech', '/assets/projects/zero_tech/home.webp', '/assets/projects/zero_tech/home_depth.webp', '#192743', '#ffffff', 0.9, 11),
  ('spatial_fusion', 'spatial_fusion', 'Meta: Spatial Fusion', 'web • design • development • 3d', '/projects/spatial_fusion', '/assets/projects/spatial_fusion/home.webp', '/assets/projects/spatial_fusion/home_depth.webp', '#D6C8ED', '#000000', 0.95, 12),
  ('worldcoin', 'worldcoin', 'Worldcoin Globe', 'api design • webgl • 3d', '/projects/worldcoin', '/assets/projects/worldcoin/home.webp', '/assets/projects/worldcoin/home_depth.webp', '#F3F4F9', '#000000', 0.975, 13),
  ('lusion_labs', 'lusion_labs', 'Manyeo Labs', 'web • design • development • 3d', '/projects/lusion_labs', '/assets/projects/lusion_labs/home.webp', '/assets/projects/lusion_labs/home_depth.webp', '#1F2022', '#ffffff', 0.85, 14),
  ('my_little_story_book', 'my_little_story_book', 'My Little Storybook', 'concept • design • development • 3d', '/projects/my_little_story_book', '/assets/projects/my_little_story_book/home.webp', '/assets/projects/my_little_story_book/home_depth.webp', '#D1DDF2', '#000000', 0.95, 15),
  ('soda_experience', 'soda_experience', 'Soda Experience', 'AR • development • 3d', '/projects/soda_experience', '/assets/projects/soda_experience/home.webp', '/assets/projects/soda_experience/home_depth.webp', '#E1E2E4', '#000000', 0.85, 16),
  ('infinite_passerella', 'infinite_passerella', 'Infinite Passerella', 'concept • design • development • 3d', '/projects/infinite_passerella', '/assets/projects/infinite_passerella/home.webp', '/assets/projects/infinite_passerella/home_depth.webp', '#28262B', '#ffffff', 0.9, 17),
  ('the_turn_of_the_screw', 'the_turn_of_the_screw', 'The Turn Of The Screw', 'design • development • 3d', '/projects/the_turn_of_the_screw', '/assets/projects/the_turn_of_the_screw/home.webp', '/assets/projects/the_turn_of_the_screw/home_depth.webp', '#2B3037', '#ffffff', 0.85, 18),
  ('maxmara_bearings_gifts', 'maxmara_bearings_gifts', 'Max Mara: Bearing Gifts', 'development • 3D', '/projects/maxmara_bearings_gifts', '/assets/projects/maxmara_bearings_gifts/home.webp', '/assets/projects/maxmara_bearings_gifts/home_depth.webp', '#d2c6b2', '#000000', 0.95, 19)
on conflict (id) do update set
  title = excluded.title,
  tags = excluded.tags,
  href = excluded.href,
  image_url = excluded.image_url,
  depth_image_url = excluded.depth_image_url,
  color_bg = excluded.color_bg,
  color_text = excluded.color_text,
  color_shadow = excluded.color_shadow,
  sort_order = excluded.sort_order;

-- 5. Upgrade existing tables (Safe to run multiple times)
alter table public.works add column if not exists description text default '';
alter table public.works add column if not exists gallery text default '';
alter table public.works add column if not exists live_url text default '';
