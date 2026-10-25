import { getOAuthUrl, type OAuthProvider } from "./api";

const NONCE_KEY = "oauth-nonce";

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

export function takeOAuthNonce() {
  const nonce = sessionStorage.getItem(NONCE_KEY);
  sessionStorage.removeItem(NONCE_KEY);
  return nonce;
}
