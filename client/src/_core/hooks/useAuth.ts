import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/sign-in" } =
    options ?? {};
  const utils = trpc.useUtils();
  
  // Get Supabase auth state
  const supabaseAuth = useSupabaseAuth();
  const { user: supabaseUser, loading: supabaseLoading } = supabaseAuth;

  // Get user data from backend (includes subscription tier, role, etc.)
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!supabaseUser, // Only fetch if Supabase user exists
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });
  
  const logout = useCallback(async () => {
    try {
      // Logout from Supabase
      await supabaseAuth.signOut();
      
      // Clear backend session
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      console.error("Logout error:", error);
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [supabaseAuth, logoutMutation, utils]);

  const state = useMemo(() => {
    // Store user info in localStorage for debugging
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(meQuery.data)
    );
    
    return {
      user: meQuery.data ?? null,
      loading: supabaseLoading || meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(supabaseUser && meQuery.data),
    };
  }, [
    supabaseUser,
    supabaseLoading,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    state.loading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
