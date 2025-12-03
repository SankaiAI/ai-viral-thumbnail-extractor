
-- 1. Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  credits int default 20,
  referral_code text unique,
  referred_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Create Policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 4. Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_referral_code text;
begin
  -- Generate a random referral code
  new_referral_code := substr(md5(random()::text), 0, 8);

  insert into public.profiles (id, email, credits, referral_code)
  values (new.id, new.email, 20, new_referral_code);
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Function to apply referral code
create or replace function public.apply_referral(code text)
returns void as $$
declare
  referrer_id uuid;
begin
  -- Find the referrer
  select id into referrer_id from public.profiles where referral_code = code;
  
  if referrer_id is not null and referrer_id != auth.uid() then
    -- Update current user if not already referred
    update public.profiles 
    set referred_by = referrer_id 
    where id = auth.uid() and referred_by is null;
    
    -- Reward referrer (e.g., +10 credits) if update happened
    if found then
      update public.profiles set credits = credits + 10 where id = referrer_id;
    end if;
  end if;
end;
$$ language plpgsql security definer;

-- 7. Function to consume credit
create or replace function public.consume_credit()
returns boolean as $$
declare
  current_credits int;
begin
  select credits into current_credits from public.profiles where id = auth.uid();
  if current_credits > 0 then
    update public.profiles set credits = credits - 1 where id = auth.uid();
    return true;
  else
    return false;
  end if;
end;
$$ language plpgsql security definer;
