let getToken: (() => Promise<string | null>) | null = null;

export function setApiGetToken(fn: () => Promise<string | null>): void {
  getToken = fn;
}

export async function getApiToken(): Promise<string | null> {
  return getToken ? getToken() : null;
}
