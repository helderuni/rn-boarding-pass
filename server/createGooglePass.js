/* eslint-env node */

const dotenv = require('dotenv');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const path = require('path');

const tenantsFile = require('../shared/tenants.json');

dotenv.config({
  path: path.resolve(__dirname, '.env'),
});

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    const error = new Error(`Missing ${name}`);
    error.statusCode = 500;
    throw error;
  }

  return value;
}

function walletConfig() {
  return {
    issuerId: requiredEnv('GOOGLE_WALLET_ISSUER_ID'),
    classSuffix: requiredEnv('GOOGLE_WALLET_CLASS_SUFFIX'),
    serviceAccountEmail: requiredEnv('GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL'),
    privateKey: requiredEnv('GOOGLE_WALLET_PRIVATE_KEY').replace(/\\n/g, '\n'),
    logoUrl: process.env.GOOGLE_WALLET_LOGO_URL,
  };
}

function getTenant(tenantId) {
  return tenantsFile.tenants.find((tenant) => tenant.id === tenantId);
}

function objectIdFor(issuerId, tenant) {
  const raw = `transit_${tenant.id}_${tenant.reference}`;
  const safe = raw.replace(/[^a-zA-Z0-9._-]/g, '_');

  return `${issuerId}.${safe}`;
}

function localized(value) {
  return {
    defaultValue: {
      language: 'en-GB',
      value,
    },
  };
}

function textField(moduleId) {
  return {
    fields: [{ fieldPath: `object.textModulesData['${moduleId}']` }],
  };
}

function twoItemRow(startId, endId) {
  return {
    twoItems: {
      startItem: { firstValue: textField(startId) },
      endItem: { firstValue: textField(endId) },
    },
  };
}

function classTemplate() {
  return {
    cardTemplateOverride: {
      cardRowTemplateInfos: [
        twoItemRow('type', 'reference'),
        twoItemRow('organisation', 'issued'),
        {
          oneItem: {
            item: { firstValue: textField('status') },
          },
        },
      ],
    },
    detailsTemplateOverride: {
      detailsItemInfos: [{ item: { firstValue: textField('usage') } }],
    },
    listTemplateOverride: {
      firstRowOption: {
        fieldOption: {
          fields: [{ fieldPath: 'object.passengerNames' }],
        },
      },
      secondRowOption: textField('reference'),
    },
  };
}

function getWalletClient(config) {
  const auth = new google.auth.JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
  });

  return google.walletobjects({
    version: 'v1',
    auth,
  });
}

function redact(message) {
  return String(message || 'Failed to create wallet pass').replace(
    /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g,
    '[redacted]'
  );
}

function publicError(error) {
  const apiMessage = error?.response?.data?.error?.message;
  const wrapped = new Error(redact(apiMessage || error.message));

  wrapped.statusCode = error.statusCode || 500;

  return wrapped;
}

async function upsertResource({ get, update, insert }) {
  try {
    await get();
  } catch (error) {
    const status = error?.response?.status;

    if (status !== 404 && status !== 403) {
      throw error;
    }

    try {
      await insert();
      return;
    } catch (insertError) {
      if (insertError?.response?.status !== 409) {
        throw insertError;
      }
    }
  }

  await update();
}

function logoImage(logoUrl, description) {
  return {
    sourceUri: { uri: logoUrl },
    contentDescription: localized(description),
  };
}

async function ensureTransitClassExists(wallet, classId, tenant, logoUrl) {
  const newClass = {
    id: classId,
    issuerName: tenant.organizationName,
    localizedIssuerName: localized(tenant.organizationName),
    transitOperatorName: localized(tenant.organizationName),
    transitType: 'OTHER',
    reviewStatus: 'UNDER_REVIEW',
    hexBackgroundColor: tenant.pass.backgroundColor,
    languageOverride: 'en-GB',
    customTicketNumberLabel: localized('Reference'),
    customFareNameLabel: localized('Type'),
    classTemplateInfo: classTemplate(),
  };

  if (logoUrl) {
    newClass.logo = logoImage(logoUrl, `${tenant.organizationName} logo`);
  }

  await upsertResource({
    get: () => wallet.transitclass.get({ resourceId: classId }),
    update: () =>
      wallet.transitclass.update({
        resourceId: classId,
        requestBody: newClass,
      }),
    insert: () => wallet.transitclass.insert({ requestBody: newClass }),
  });
}

async function ensureTransitObjectExists(wallet, { objectId, classId, tenant, passenger }) {
  const newObject = {
    id: objectId,
    classId,
    state: 'ACTIVE',
    tripType: 'ROUND_TRIP',
    passengerType: 'SINGLE_PASSENGER',
    passengerNames: passenger,
    ticketNumber: tenant.reference,
    customTicketStatus: localized(tenantsFile.status),
    hexBackgroundColor: tenant.pass.backgroundColor,
    ticketLeg: {
      originName: localized(tenant.shortName),
      fareName: localized(tenantsFile.cardType),
    },
    barcode: {
      type: 'QR_CODE',
      value: tenant.reference,
      alternateText: tenant.reference,
    },
    textModulesData: [
      { id: 'status', header: 'Status', body: tenantsFile.status },
      { id: 'type', header: 'Type', body: tenantsFile.cardType },
      { id: 'reference', header: 'Reference', body: tenant.reference },
      { id: 'organisation', header: 'Organisation', body: tenant.organizationName },
      { id: 'issued', header: 'Issued', body: tenantsFile.issued },
      { id: 'usage', header: 'How to use', body: tenantsFile.usage },
    ],
  };

  await upsertResource({
    get: () => wallet.transitobject.get({ resourceId: objectId }),
    update: () =>
      wallet.transitobject.update({
        resourceId: objectId,
        requestBody: newObject,
      }),
    insert: () => wallet.transitobject.insert({ requestBody: newObject }),
  });
}

async function createGooglePass({ tenantId, name }) {
  const tenant = getTenant(tenantId);

  if (!tenant) {
    const error = new Error('Unknown tenant');
    error.statusCode = 400;
    throw error;
  }

  const passenger =
    typeof name === 'string' && name.trim() ? name.trim() : tenantsFile.passengerName;
  const config = walletConfig();
  if (!config.logoUrl) {
    const error = new Error(
      'Transit passes need GOOGLE_WALLET_LOGO_URL set to a public HTTPS image.'
    );
    error.statusCode = 500;
    throw error;
  }

  const classId = `${config.issuerId}.${config.classSuffix}-transit`;
  const objectId = objectIdFor(config.issuerId, tenant);
  const wallet = getWalletClient(config);

  try {
    await ensureTransitClassExists(wallet, classId, tenant, config.logoUrl);
    await ensureTransitObjectExists(wallet, { objectId, classId, tenant, passenger });
  } catch (error) {
    throw publicError(error);
  }

  const signedJwt = jwt.sign(
    {
      iss: config.serviceAccountEmail,
      aud: 'google',
      typ: 'savetowallet',
      origins: [],
      payload: {
        transitObjects: [{ id: objectId }],
      },
    },
    config.privateKey,
    { algorithm: 'RS256' }
  );

  return {
    ok: true,
    classId,
    objectId,
    jwt: signedJwt,
  };
}

module.exports = { createGooglePass };
