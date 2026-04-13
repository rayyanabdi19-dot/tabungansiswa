
CREATE OR REPLACE FUNCTION public.check_nis_exists(_nis text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students WHERE nis = _nis
  )
$$;
