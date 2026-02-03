import AuthCallbackClient from './AuthCallbackClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackClient />
    </Suspense>
  );
}
