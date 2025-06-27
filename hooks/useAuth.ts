"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createSupabaseBrowserClient());

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (error || !user) {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        setUser(user);

        // Get or create profile
        const profile = await getOrCreateProfile(
          user.id,
          user.email || "",
          user.user_metadata
        );

        if (!mounted) return;

        setUserProfile(profile);
        setLoading(false);
      } catch (error) {
        if (!mounted) return;
        setLoading(false);
      }
    };

    init();

    // Auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT") {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getOrCreateProfile = async (
    userId: string,
    email: string,
    userMetadata: any
  ): Promise<UserProfile | null> => {
    try {
      // Try to get existing profile
      const { data: existing } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (existing) {
        return existing;
      }

      // Extract profile data from Google metadata
      const fullName =
        userMetadata?.full_name || userMetadata?.name || "Usuario";

      // Create new profile
      const { data: newProfile } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: email,
          nombre: fullName,
          configurado: false,
        })
        .select()
        .single();

      return newProfile;
    } catch (error) {
      return null;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return false;

    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        return false;
      }

      setUserProfile(data);
      return true;
    } catch (error) {
      return false;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {}
  };

  // Helper to get user's avatar URL
  const getAvatarUrl = () => {
    return (
      user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
    );
  };

  return {
    user,
    userProfile,
    loading,
    updateUserProfile,
    signOut,
    getAvatarUrl,
    supabase,
  };
}
