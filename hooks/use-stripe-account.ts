import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface StripeAccountStatus {
  hasAccount: boolean;
  account: {
    id: string;
    detailsSubmitted: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    status: string;
  } | null;
  isLoading: boolean;
  error?: string;
}

export function useStripeAccount() {
  const { user } = useAuth();
  const [status, setStatus] = useState<StripeAccountStatus>({
    hasAccount: false,
    account: null,
    isLoading: true,
  });

  const fetchStatus = useCallback(async () => {
    if (user?.role !== 'SELLER') {
      setStatus({
        hasAccount: false,
        account: null,
        isLoading: false,
      });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      const response = await fetch('/api/stripe/connect/account');
      
      if (response.ok) {
        const data = await response.json();
        setStatus({
          hasAccount: data.hasAccount,
          account: data.account,
          isLoading: false,
          error: data.error,
        });
      } else {
        setStatus({
          hasAccount: false,
          account: null,
          isLoading: false,
          error: 'Failed to fetch account status',
        });
      }
    } catch (error) {
      setStatus({
        hasAccount: false,
        account: null,
        isLoading: false,
        error: 'Network error',
      });
    }
  }, [user?.role]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const isVerified = status.hasAccount && status.account?.detailsSubmitted && status.account?.chargesEnabled;
  
  return {
    ...status,
    isVerified,
    refresh: fetchStatus,
  };
}