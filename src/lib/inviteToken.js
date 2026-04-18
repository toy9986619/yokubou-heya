const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const TOKEN_LENGTH = 32;

export const generateInviteToken = () => {
  const randomBytes = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(randomBytes);
  let token = '';
  for (let i = 0; i < TOKEN_LENGTH; i += 1) {
    token += ALPHABET[randomBytes[i] % ALPHABET.length];
  }
  return token;
};
