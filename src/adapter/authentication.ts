export function getToken(): string {
  const [, token] = location.hash.match(/^#access_token=([^&]+)/) ?? [];
  if (token) {
    return token;
  }

  return (location.href =
    `https://accounts.spotify.com/authorize` +
    `?response_type=token` +
    `&client_id=${encodeURIComponent('f01827066edb4a7abc144de5ab994698')}` +
    `&redirect_uri=${encodeURIComponent(location.href)}`);
}
