export const getClientId = (): string => process.env.CLIENT_ID ?? "35321";

export const getStoreSlug = (): string | undefined => {
  const slug = process.env.STORE_SLUG?.trim();

  return slug || undefined;
};

export const getOAuthInstallUrl = (): string => {
  const appId = getClientId();
  const slug = getStoreSlug();
  const state = "install";

  if (slug) {
    return `https://${slug}.mitiendanube.com/admin/apps/${appId}/authorize?state=${state}`;
  }

  return `https://www.tiendanube.com/apps/${appId}/authorize?state=${state}`;
};

export const getExpectedCallbackUrl = (): string => {
  const base = process.env.APP_PUBLIC_URL?.replace(/\/$/, "");

  if (base) {
    return `${base}/auth/install`;
  }

  return "/auth/install";
};
