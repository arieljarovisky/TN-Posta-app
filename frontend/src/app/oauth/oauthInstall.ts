const redirectToInstall = (code: string) => {
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
