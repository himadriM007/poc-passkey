import jwt from 'jsonwebtoken';
import {
  AuthorizationCode,
  Client,
  Falsey,
  Token,
  User,
} from 'oauth2-server';

const clients: Client[] = [
    {
      id: 'client1',
      clientSecret: 'secret1',
      redirectUris: ['http://localhost:3000/callback'],
      grants: ['password', 'refresh_token', 'authorization_code'],
    },
  ],
  users: User[] = [
    {
      id: '1',
      email: 'himadri.mallick@digitalavenues.com',
      name: 'Himadri Mallick',
      picture: 'https://example.com/johndoe.jpg',
      password: 'Password@123',
    },
    {
      id: '2',
      email: 'amit@example.com',
      name: 'John Doe',
      picture: 'https://example.com/johndoe.jpg',
      password: 'password',
    },
  ],
  tokens: Token[] = [],
  authorizationCodes: AuthorizationCode[] = [],
  secretKey = process.env.SECRET_KEY ?? 'Password@123';

const getAccessToken = (token: string): Token | null => {
  const accessToken = tokens.find((t) => t.accessToken === token);
  return accessToken ? accessToken : null;
};

const generateAccessToken = (
  client_id: string,
  client_secret: string,
  code: string
): string | Falsey => {
  const userInfo = authorizationCodes.find(
    (el) => el.authorizationCode === code
  );

  if (!userInfo) {
    return null;
  }

  const accessTokenLifetime = userInfo?.client?.accessTokenLifetime
      ? userInfo?.client?.accessTokenLifetime / 3600
      : 1,
    token = jwt.sign(userInfo, secretKey, {
      expiresIn: accessTokenLifetime + 'h',
    });

  return token;
};

const getUserFullInfo = (token: string) => {
  const userInfo = jwt.verify(token, secretKey);
  return userInfo;
};

const saveToken = (token: Token, client: Client, user: User): Token => {
  token.client = client;
  token.user = user;
  token.provider = 'passkey';
  tokens.push(token);

  return token;
};

const getClient = (clientId: string, clientSecret: string): Client | null => {
  const client = clients.find(
    (c) => c.id === clientId && c.clientSecret === clientSecret
  );
  return client ? client : null;
};

const checkClient = (clientId: string): boolean => {
  return Boolean(clients.find((el) => el.id === clientId));
};

const getUser = (username: string, password: string): User | null => {
  const user = users.find(
    (u) => u.email === username && u.password === password
  );
  return user ? user : null;
};

const getAuthorizationCode = (code: string): AuthorizationCode | null => {
  const authCode = authorizationCodes.find((c) => c.authorizationCode === code);
  return authCode ? authCode : null;
};

const saveAuthorizationCode = (
  code: string,
  clientId: string,
  redirectUri: string,
  user: User,
  scope?: string
): void => {
  const client: Client = {
    id: clientId,
    redirectUris: [redirectUri],
    grants: 'authorization_code',
    accessTokenLifetime: 3600,
    refreshTokenLifetime: 1209600,
  };

  authorizationCodes.push({
    authorizationCode: code,
    expiresAt: new Date(Date.now() + 3600 * 1000),
    client,
    redirectUri,
    scope,
    user,
  });
};

const revokeAuthorizationCode = (code: AuthorizationCode): boolean => {
  const index = authorizationCodes.findIndex(
    (c) => c.authorizationCode === code.authorizationCode
  );

  if (index !== -1) {
    authorizationCodes.splice(index, 1);
    return true;
  }
  return false;
};

const oAuthModal: any = {
  getAccessToken,
  generateAccessToken,
  getUserFullInfo,
  saveToken,
  getClient,
  checkClient,
  getUser,
  getAuthorizationCode,
  saveAuthorizationCode,
  revokeAuthorizationCode,
};

export default oAuthModal;
