"use client";

import React from 'react';
import { useBanCheck } from '~/hooks/useBanCheck';

interface BanCheckProviderProps {
  children: React.ReactNode;
}

export default function BanCheckProvider({ children }: BanCheckProviderProps) {
  useBanCheck();
  
  return <>{children}</>;
}
