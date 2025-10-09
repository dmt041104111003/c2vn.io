import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useDeviceFingerprint } from './useDeviceFingerprint';

export function useBanCheck() {
  const { data: session, status } = useSession();
  const { deviceData } = useDeviceFingerprint();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkBanStatus = async () => {
      if (status !== 'authenticated' || !session || !deviceData || isChecking) {
        return;
      }

      setIsChecking(true);

      try {
        const response = await fetch('/api/device/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceData })
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.data.isBanned) {
            
            await signOut({ 
              redirect: false,
              callbackUrl: '/auth/banned'
            });
            
            window.location.href = '/auth/banned';
          }
        }
      } catch (error) {
      } finally {
        setIsChecking(false);
      }
    };

    checkBanStatus();

    const interval = setInterval(checkBanStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session, status, deviceData, isChecking]);

  return { isChecking };
}
