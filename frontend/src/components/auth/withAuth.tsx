import type { ComponentType } from 'react';
import { ProtectedRoute } from './ProtectedRoute';

export function withAuth<P extends object>(Page: ComponentType<P>) {
  return function Guarded(props: P) {
    return (
      <ProtectedRoute>
        <Page {...props} />
      </ProtectedRoute>
    );
  };
}
