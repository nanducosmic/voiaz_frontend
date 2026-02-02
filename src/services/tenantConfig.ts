import API from './api';

export const updateTenantConfig = (tenantId: string, data: { bolnaAgentId: string; assignedNumber: string }) =>
  API.patch(`/tenants/${tenantId}/config`, data);
