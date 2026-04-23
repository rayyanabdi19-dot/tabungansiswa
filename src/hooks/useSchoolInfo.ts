import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SchoolInfo {
  name: string;
  logo_url: string | null;
  address: string | null;
  npsn: string | null;
  phone: string | null;
  email: string | null;
  principal: string | null;
}

export const useSchoolInfo = () => {
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.rpc("get_school_info").then(({ data }) => {
      if (data && (data as any[]).length > 0) {
        setSchool((data as any[])[0] as SchoolInfo);
      }
      setLoading(false);
    });
  }, []);

  return { school, loading };
};
