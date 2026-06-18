'use client';

import { ToastProvider } from '@/components/Toast';
import { RosettaApp } from '@/components/RosettaApp';

export default function Page() {
  return (
    <ToastProvider>
      <RosettaApp />
    </ToastProvider>
  );
}
