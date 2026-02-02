import React, { useEffect, useState } from 'react';
import { getTenants } from '@/services/api';
import { useTenant } from '@/context/TenantContext';

interface Tenant {
  _id: string; // ✅ Changed from id to _id
  name: string;
}

const TenantSelector: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const { tenantId, setTenantId } = useTenant();

  useEffect(() => {
    getTenants().then(res => {
      // Check the structure of your response
      const data = res.data?.data || res.data?.tenants || (Array.isArray(res.data) ? res.data : []);
      setTenants(data);
    });
  }, []);

  const filtered = tenants.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="text"
        placeholder="Search tenants..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 8, padding: '4px', width: '100%', color: 'black' }}
      />
      <select
        value={tenantId || ''}
        onChange={e => setTenantId(e.target.value || null)}
        style={{ width: '100%', padding: '4px', color: 'black' }}
      >
        <option value="">All Tenants (Aggregated)</option>
        {filtered.map(t => (
          <option key={t._id} value={t._id}> {/* ✅ Changed to t._id */}
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TenantSelector;
