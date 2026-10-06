import tenantsFile from '../shared/tenants.json';

export type TenantId = 'helderville';

export type Tenant = {
  id: TenantId;
  name: string;
  shortName: string;
  reference: string;
  organizationName: string;
  colors: {
    logo: string;
    qr: string;
    qrBackground: string;
    onButton: string;
    accent: string;
    ink: string;
    card: string;
    line: string;
  };
};

const tenants = tenantsFile.tenants as Tenant[];

export const passengerName = tenantsFile.passengerName;
export const cardType = tenantsFile.cardType;
export const cardStatus = tenantsFile.status;
export const issuedOn = tenantsFile.issued;

export function getTenant(id: TenantId): Tenant {
  const tenant = tenants.find((item) => item.id === id);

  if (!tenant) {
    throw new Error(`Unknown tenant: ${id}`);
  }

  return tenant;
}
