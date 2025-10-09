import { useEffect, useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useDeviceFingerprint } from './useDeviceFingerprint';

export function useBanCheck() {
  const { data: session, status } = useSession();
  const { deviceData } = useDeviceFingerprint();
  const [isChecking, setIsChecking] = useState(false);
  const lastCheckTime = useRef<number>(0);
  const isRedirecting = useRef<boolean>(false);

  useEffect(() => {
    const checkBanStatus = async () => {
      if (status !== 'authenticated' || !session || !deviceData || isChecking || isRedirecting.current) {
        return;
      }

      const now = Date.now();
      if (now - lastCheckTime.current < 60 * 1000) {
        return;
      }

      setIsChecking(true);
      lastCheckTime.current = now;

      try {
        const response = await fetch('/api/device/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceData })
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.data.isBanned) {
            isRedirecting.current = true;
            
            await signOut({ 
              redirect: false,
              callbackUrl: '/auth/banned'
            });
            
            window.location.href = '/auth/banned';
            return;
          }
        }
      } catch (error) {
        console.error('Ban check error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (status === 'authenticated' && session && deviceData) {
      checkBanStatus();
    }

    const interval = setInterval(checkBanStatus, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session, status, deviceData, isChecking]);

  return { isChecking };
}
