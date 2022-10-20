export function getToken(): string {
  const [, token] = location.hash.match(/^#access_token=([^&]+)/) ?? [];
  if (token) {
    return token;
  }

  return (location.href =
    `https://accounts.spotify.com/authorize` +
    `?response_type=token` +
    `&client_id=${encodeURIComponent('e61c27b7de0b4f0b82033dc83aeea1e6')}` +
    `&redirect_uri=${encodeURIComponent(location.href)}`);
}
