-- Run in Supabase SQL Editor for project Tochka Messenger.
alter table public.messages add column if not exists edited_at timestamptz;
alter table public.messages enable row level security;
drop policy if exists messages_edit_own on public.messages;
drop policy if exists messages_delete_own on public.messages;
create policy messages_edit_own on public.messages
for update to authenticated
using (sender_id = (select auth.uid()) and public.can_read_room(room_id))
with check (sender_id = (select auth.uid()) and public.can_read_room(room_id));
create policy messages_delete_own on public.messages
for delete to authenticated
using (sender_id = (select auth.uid()) and public.can_read_room(room_id));
grant update(body,edited_at), delete on public.messages to authenticated;
-- Prevent users from modifying old message timestamps or ownership.
revoke update on public.messages from authenticated;
grant update(body,edited_at) on public.messages to authenticated;
