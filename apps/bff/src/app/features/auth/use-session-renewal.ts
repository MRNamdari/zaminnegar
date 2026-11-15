'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/app/_lib/api.client';

const RENEWAL_INTERVAL = 20 * 60 * 1000;

export function useSessionRenewal() {
  const lastRenewal = useRef(Date.now());
    
  const { mutate, isPending } = useMutation({
    ...api.mutation('post','/auth/session/renew').mutationOptions,

    onSuccess: (data) => {
      lastRenewal.current = Date.now();
    },

    onError(error, variables, onMutateResult, context) {
      if (error){
       console.log( error.status)
      }
    },
  });

  useEffect(() => {
    const handleActivity = () => {
      const elapsed = Date.now() - lastRenewal.current;

      if (elapsed >= RENEWAL_INTERVAL && !isPending) {
        mutate({});
      }
    };

    const events = [
      'pointerdown',
      'keydown',
      'touchstart',
      'scroll',
    ] as const;

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, {
        passive: true,
      });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [mutate, isPending]);

}