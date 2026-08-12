-- Baseline capture of storage.objects RLS (avatars bucket) and the
-- auth.users signup trigger, as they exist on the live project.
--
-- These schemas (storage, auth) are Supabase-managed — this migration
-- documents/tracks their current state rather than being something a
-- fresh project would replay verbatim. See supabase/migrations/README.md.

-- NOTE: there are two functionally-identical sets of avatar policies
-- currently live (the original named set, plus a newer avatars_* set).
-- Captured as-is; deduping is a follow-up, not done here since it
-- changes production RLS and wasn't asked for as part of this pass.

CREATE POLICY "Public read access for avatars" ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));

CREATE POLICY avatars_owner_delete ON storage.objects FOR DELETE USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
CREATE POLICY avatars_owner_update ON storage.objects FOR UPDATE USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
CREATE POLICY avatars_owner_write ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
CREATE POLICY avatars_public_read ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));

-- Fires public.handle_new_user() on every new Supabase Auth signup.
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
