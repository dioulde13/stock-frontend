'use client';

import { ReactNode } from 'react';
import { useFetchInterceptor } from './fetchInterceptor';

export default function FetchInterceptorWrapper({ children }: { children: ReactNode }) {
  useFetchInterceptor();
  return <>{children}</>;
}
