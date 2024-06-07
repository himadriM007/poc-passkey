import jwt from 'jsonwebtoken';
import { AuthorizationCode, Client, Falsey, Token, User } from 'oauth2-server';
import { callDatabaseFunction } from '../services/dbService';

const tokens: Token[] = [],
  authorizationCodes: AuthorizationCode[] = [],
  secretKey = process.env.SECRET_KEY ?? 'Password@123';

const getAccessToken = (token: string): Token | null => {
  const accessToken = tokens.find((t) => t.accessToken === token);
  return accessToken ? accessToken : null;
};

const generateAccessToken = async (
  client_id: string,
  client_secret: string,
  code: string
): Promise<string | Falsey> => {
  const authCodeArr: any = await callDatabaseFunction(
      'fn_get_authorization_code',
      [{ code }]
    ),
    authCode = authCodeArr[0];

  if (!authCode) {
    return null;
  }

  const accessTokenLifetime = authCode?.client?.accessTokenLifetime
      ? authCode?.client?.accessTokenLifetime / 3600
      : 1,
    token = jwt.sign(authCode, secretKey, {
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

const getClient = async (
  clientId: string,
  clientSecret: string
): Promise<Client | null> => {
  const client: any = await callDatabaseFunction('fn_get_client', [
    { client_id: clientId, client_secret: clientSecret },
  ]);

  return client?.length ? client : null;
};

const checkClient = async (clientId: string): Promise<boolean> => {
  const client: any = await callDatabaseFunction('fn_get_client', [
    { client_id: clientId },
  ]);

  return client.length > 0;
};

const getUser = async (
  email: string,
  password: string
): Promise<User | null> => {
  const user: any = await callDatabaseFunction('fn_get_user', [
    { email, password },
  ]);

  return user?.length ? user[0] : null;
};

const getAuthorizationCode = async (
  code: string
): Promise<AuthorizationCode | null> => {
  const authCode: any = await callDatabaseFunction(
    'fn_get_authorization_code',
    [{ code }]
  );

  return authCode ? authCode : null;
};

const saveAuthorizationCode = async (
  code: string,
  clientId: string,
  redirectUri: string,
  user: User,
  scope?: string
): Promise<boolean> => {
  const response: any = await callDatabaseFunction(
    'fn_save_authorization_code',
    [
      {
        authorization_code: code,
        client_id: clientId,
        redirect_uri: redirectUri,
        grants: 'authorization_code',
        user_id: user.id,
        scope,
        expires_at: new Date(Date.now() + 3600 * 1000),
      },
    ]
  );

  return response;
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
