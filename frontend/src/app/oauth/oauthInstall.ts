const getAdminAppUrl = (): string | null => {
  const config = window.__TN_POSTA_CONFIG__ ?? {};
  const configured = config.storeAdminUrl?.trim();

  if (configured) {
    return configured;
  }

  const slug = config.storeSlug?.trim();
  const appId = config.clientId ?? "35321";

  if (slug) {
    return `https://${slug}.mitiendanube.com/admin/v2/apps/${appId}`;
  }

  return null;
};

export const redirectToAdminIfInstalled = (): boolean => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("installed") !== "1") {
    return false;
  }

  const adminUrl = getAdminAppUrl();

  if (!adminUrl) {
    return false;
  }

  window.location.replace(adminUrl);
  return true;
};

const redirectToInstall = (code: string) => {
  console.info("[auth/frontend] Redirigiendo code OAuth a /auth/install", {
    codeLength: code.length,
    fromPath: window.location.pathname,
  });

  window.location.replace(
    `/auth/install?code=${encodeURIComponent(code)}`
  );
};

export const completeOAuthInstallIfNeeded = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (!code || window.location.pathname === "/auth/install") {
    return false;
  }

  redirectToInstall(code);
  return true;
};

export const getInstallStatusFromUrl = (): {
  installed: boolean;
  missingCode: boolean;
  error?: string;
} => {
  const params = new URLSearchParams(window.location.search);

  return {
    installed: params.get("installed") === "1",
    missingCode: params.get("install") === "missing_code",
    error: params.get("install_error") ?? undefined,
  };
};

export const clearInstallParamsFromUrl = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete("installed");
  url.searchParams.delete("install");
  url.searchParams.delete("install_error");
  url.searchParams.delete("code");
  window.history.replaceState({}, "", `${url.pathname}${url.search}`);
};
