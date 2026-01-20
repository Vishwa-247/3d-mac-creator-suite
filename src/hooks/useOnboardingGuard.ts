/**
 * OnboardingGuard Hook
 * Checks if user has completed onboarding, redirects to /onboarding if not.
 * Uses Supabase to check user_onboarding table.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStatus {
  isLoading: boolean;
  isCompleted: boolean;
  data: any | null;
}

export function useOnboardingGuard(userId: string | undefined): OnboardingStatus {
  const [status, setStatus] = useState<OnboardingStatus>({
    isLoading: true,
    isCompleted: false,
    data: null,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!userId) {
      setStatus({ isLoading: false, isCompleted: false, data: null });
      return;
    }

    // Skip check if already on onboarding page
    if (location.pathname === '/onboarding') {
      setStatus({ isLoading: false, isCompleted: false, data: null });
      return;
    }

    async function checkOnboarding() {
      try {
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned (user hasn't completed onboarding)
          console.error('Onboarding check error:', error);
        }

        const isCompleted = data?.completed_at != null;

        if (!isCompleted) {
          // Redirect to onboarding if not completed
          navigate('/onboarding', { replace: true });
        }

        setStatus({
          isLoading: false,
          isCompleted,
          data,
        });
      } catch (err) {
        console.error('Onboarding check failed:', err);
        setStatus({ isLoading: false, isCompleted: false, data: null });
        navigate('/onboarding', { replace: true });
      }
    }

    checkOnboarding();
  }, [userId, navigate, location.pathname]);

  return status;
}
