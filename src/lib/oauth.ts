import { getOAuthUrl, type OAuthProvider } from "./api";

const NONCE_KEY = "oauth-nonce";
const SIGNUP_KEY = "oauth-signup";

export type PendingSignup = {
  provider: OAuthProvider;
  token: string;
  username: string;
};

export const OAUTH_PROVIDERS: OAuthProvider[] = ["discord", "twitch"];

export const oauthLabels: Record<OAuthProvider, string> = {
  discord: "Discord",
  twitch: "Twitch",
};

export const oauthColors: Record<OAuthProvider, string> = {
  discord: "bg-[#5865F2]",
  twitch: "bg-[#9146FF]",
};

export function isOAuthProvider(value: string): value is OAuthProvider {
  return (OAUTH_PROVIDERS as string[]).includes(value);
}

export async function startOAuth(provider: OAuthProvider, token?: string, communityId?: number) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  sessionStorage.setItem(NONCE_KEY, nonce);
  window.location.assign(await getOAuthUrl(provider, nonce, token, communityId));
}

export function savePendingSignup(signup: PendingSignup) {
  sessionStorage.setItem(SIGNUP_KEY, JSON.stringify(signup));
}

export function readPendingSignup() {
  return sessionStorage.getItem(SIGNUP_KEY);
}

export function clearPendingSignup() {
  sessionStorage.removeItem(SIGNUP_KEY);
}

export function parsePendingSignup(raw: string | null | undefined): PendingSignup | null {
  if (!raw) return null;
  try {
    const signup = JSON.parse(raw);
    return isOAuthProvider(signup.provider) &&
      typeof signup.token === "string" &&
      typeof signup.username === "string"
      ? signup
      : null;
  } catch {
    return null;
  }
}

export function takeOAuthNonce() {
  const nonce = sessionStorage.getItem(NONCE_KEY);
  sessionStorage.removeItem(NONCE_KEY);
  return nonce;
}
