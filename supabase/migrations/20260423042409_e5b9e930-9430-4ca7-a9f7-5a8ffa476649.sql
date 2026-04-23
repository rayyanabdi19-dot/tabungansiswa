
CREATE OR REPLACE FUNCTION public.get_school_info()
RETURNS TABLE(name text, logo_url text, address text, npsn text, phone text, email text, principal text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.name, s.logo_url, s.address, s.npsn, s.phone, s.email, s.principal
  FROM public.school_settings s
  LIMIT 1
$$;
