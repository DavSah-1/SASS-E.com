import { getLoginUrl } from "@/const";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();
  
  // Check auth mode from environment
  const authMode = import.meta.env.VITE_AUTH_MODE || "manus";
  
  // Get Supabase auth state (only used if authMode is supabase)
  const supabaseAuth = useSupabaseAuth();
  const { user: supabaseUser, loading: supabaseLoading } = supabaseAuth;

  // Get user data from backend (works for both auth modes)
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    // For Supabase mode, only fetch if Supabase user exists
    // For Manus mode, always try to fetch (backend will verify session cookie)
    enabled: authMode === "manus" || !!supabaseUser,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });
  
  const logout = useCallback(async () => {
    try {
      if (authMode === "supabase") {
        // Logout from Supabase
        await supabaseAuth.signOut();
      }
      
      // Clear backend session
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      console.error("Logout error:", error);
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [authMode, supabaseAuth, logoutMutation, utils]);

  const state = useMemo(() => {
    // Store user info in localStorage for debugging
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(meQuery.data)
    );
    
    // Calculate loading state based on auth mode
    const loading = authMode === "supabase"
      ? supabaseLoading || meQuery.isLoading || logoutMutation.isPending
      : meQuery.isLoading || logoutMutation.isPending;
    
    // Calculate authenticated state based on auth mode and provider
    // If backend returns user data, check the authProvider field
    const backendAuthProvider = meQuery.data?.authProvider;
    
    const isAuthenticated = authMode === "supabase"
      ? backendAuthProvider === "manus" 
        ? Boolean(meQuery.data) // Manus OAuth user (admin) - only need backend data
        : Boolean(supabaseUser && meQuery.data) // Supabase user - need both
      : Boolean(meQuery.data); // Manus-only mode
    
    return {
      user: meQuery.data ?? null,
      loading,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated,
    };
  }, [
    authMode,
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
