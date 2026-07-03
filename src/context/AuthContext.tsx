import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  status: string;
}

interface AuthContextType {
  session: any;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, profile: null, loading: true, isAdmin: false, isSuperAdmin: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single();
    setProfile(data || null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) await fetchProfile(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) await fetchProfile(session.user.id);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = profile?.role === "facility_admin" || profile?.role === "super_admin";
  const isSuperAdmin = profile?.role === "super_admin";

  return (
    <AuthContext.Provider value={{ session, profile, loading, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
