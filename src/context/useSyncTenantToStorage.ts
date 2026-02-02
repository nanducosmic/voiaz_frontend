import { useEffect } from 'react';
import { useTenant } from './TenantContext';

export default function useSyncTenantToStorage() {
  const { tenantId } = useTenant();
  useEffect(() => {
    if (tenantId) {
      localStorage.setItem('selectedTenantId', tenantId);
    } else {
      localStorage.removeItem('selectedTenantId');
    }
  }, [tenantId]);
}
