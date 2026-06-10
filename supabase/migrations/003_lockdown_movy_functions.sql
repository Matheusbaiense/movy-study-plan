-- Lock down helper functions used by triggers/RLS so they are not callable as public RPC.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.current_user_role() from public, anon;
revoke execute on function public.is_active_user() from public, anon;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_active_user() to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
