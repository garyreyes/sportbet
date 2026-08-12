-- Phase 7a / Security Baseline #16: enforce a MIME-type allowlist and size
-- cap on the avatars bucket server-side, not just a client-side filename
-- check. Existing storage.objects RLS already restricts writes to the
-- uploader's own folder — this is the content-validation half.

UPDATE storage.buckets
SET file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'avatars';
