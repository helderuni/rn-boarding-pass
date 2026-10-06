/* eslint-env node */
const fs = require('fs');
const { PKPass } = require('passkit-generator');
const path = require('path');

const tenantsFile = require('../shared/tenants.json');

const certDirectory = path.resolve(__dirname, 'cert');
const wwdr = fs.readFileSync(path.join(certDirectory, 'wwdr.pem'));
const signerCert = fs.readFileSync(path.join(certDirectory, 'signerCert.pem'));
const signerKey = fs.readFileSync(path.join(certDirectory, 'signerKey.pem'));

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  return `rgb(${red}, ${green}, ${blue})`;
}

function getTenant(tenantId) {
  return tenantsFile.tenants.find((tenant) => tenant.id === tenantId);
}

function setFields(fields, next) {
  if (fields.length) {
    fields.splice(0, fields.length);
  }

  fields.push(...next);
}

async function createTravelPass({ tenantId, name }) {
  const tenant = getTenant(tenantId);

  if (!tenant) {
    const error = new Error('Unknown tenant');
    error.statusCode = 400;
    throw error;
  }

  const passenger =
    typeof name === 'string' && name.trim() ? name.trim() : tenantsFile.passengerName;

  const pass = await PKPass.from(
    {
      model: path.resolve(__dirname, 'qr-travel.pass'),
      certificates: {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase: 'test',
      },
    },
    {
      serialNumber: `${tenant.id}-${tenant.reference}`,
      description: `${tenant.organizationName} QR travel card`,
      organizationName: tenant.organizationName,
      logoText: tenant.shortName,
      backgroundColor: hexToRgb(tenant.pass.backgroundColor),
      foregroundColor: hexToRgb(tenant.pass.foregroundColor),
      labelColor: hexToRgb(tenant.pass.labelColor),
    }
  );

  setFields(pass.headerFields, [{ key: 'status', label: 'STATUS', value: tenantsFile.status }]);
  setFields(pass.primaryFields, [{ key: 'passenger', label: 'PASSENGER', value: passenger }]);
  setFields(pass.secondaryFields, [
    { key: 'type', label: 'TYPE', value: tenantsFile.cardType },
    { key: 'reference', label: 'REFERENCE', value: tenant.reference },
  ]);
  setFields(pass.auxiliaryFields, [
    { key: 'organisation', label: 'ORGANISATION', value: tenant.organizationName },
    { key: 'issued', label: 'ISSUED', value: tenantsFile.issued },
  ]);
  setFields(pass.backFields, [
    { key: 'usage', label: 'HOW TO USE', value: tenantsFile.usage },
    { key: 'issuer', label: 'ISSUED BY', value: tenant.organizationName },
    { key: 'cardType', label: 'CARD', value: tenantsFile.cardType },
    { key: 'cardReference', label: 'REFERENCE', value: tenant.reference },
    { key: 'cardStatus', label: 'STATUS', value: tenantsFile.status },
    { key: 'issuedOn', label: 'ISSUED', value: tenantsFile.issued },
  ]);

  pass.setBarcodes({
    format: 'PKBarcodeFormatQR',
    message: tenant.reference,
    messageEncoding: 'iso-8859-1',
    altText: tenant.reference,
  });

  for (const [fileName, relativePath] of Object.entries(tenant.walletImages)) {
    const filePath = path.resolve(__dirname, relativePath);
    pass.addBuffer(fileName, fs.readFileSync(filePath));
  }

  return pass.getAsBuffer();
}

module.exports = { createTravelPass };
