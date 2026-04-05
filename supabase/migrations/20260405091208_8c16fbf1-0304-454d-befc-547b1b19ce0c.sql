
CREATE OR REPLACE FUNCTION public.link_parent_to_student(_nis text, _parent_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.students
  SET parent_user_id = _parent_user_id
  WHERE nis = _nis AND (parent_user_id IS NULL OR parent_user_id = _parent_user_id);
  RETURN FOUND;
END;
$$;
