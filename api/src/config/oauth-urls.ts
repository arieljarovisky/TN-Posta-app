export const getClientId = (): string => process.env.CLIENT_ID ?? "35321";

export const getStoreSlug = (): string | undefined => {
  const slug = process.env.STORE_SLUG?.trim();

  return slug || undefined;
};

/**
 * URL oficial de OAuth. Funciona para instalar y reinstalar.
 * NO usar /admin/apps/.../authorize: si la app ya esta instalada, abre el dashboard sin codigo.
 */
export const getOAuthInstallUrl = (): string => {
  const appId = getClientId();

  return `https://www.tiendanube.com/apps/${appId}/authorize?state=install`;
};

export const getExpectedCallbackUrl = (): string => {
  const base = process.env.APP_PUBLIC_URL?.replace(/\/$/, "");

  if (base) {
    return `${base}/auth/install`;
  }

  return "/auth/install";
};

export const getStoreAdminAppUrl = (): string | undefined => {
  const slug = getStoreSlug();
  const appId = getClientId();

  if (!slug) {
    return undefined;
  }

  return `https://${slug}.mitiendanube.com/admin/v2/apps/${appId}`;
};

export const getStoreAppsUrl = (): string | undefined => {
  const slug = getStoreSlug();

  if (!slug) {
    return undefined;
  }

  return `https://${slug}.mitiendanube.com/admin/v2/apps/`;
};
