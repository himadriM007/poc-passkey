import { Request, Response } from 'express';
import OAuth2Server from 'oauth2-server';
import crypto from 'crypto';
import oAuthModal from '../models/oAuthModel';

const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;

const oauth = new OAuth2Server({
  model: oAuthModal,
  accessTokenLifetime: 3600,
  allowBearerTokensInQueryString: true,
});

export const generateToken = async (req: Request, res: Response) => {
  try {
    const { client_id, client_secret, code } = req.body;

    const token = await oAuthModal.generateAccessToken(
      client_id,
      client_secret,
      code
    );

    if (token) {
      res.status(200).json({ access_token: token });
    } else {
      res
        .status(400)
        .json({ error: 'Either user id is not present or not valid' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getAuthorizeUser = async (req: Request, res: Response) => {
  try {
    const { query } = req,
      {
        login_hint,
        promt,
        response_type,
        redirect_uri,
        state,
        client_id,
        scope,
      } = query;

    if (await oAuthModal.checkClient(client_id)) {
      res.send(`
        <div>
          <form method="post" action="/oauth/authorize">
            <input type="hidden" name="client_id" value="${client_id}">
            <input type="hidden" name="redirect_uri" value="${redirect_uri}">
            <input type="hidden" name="response_type" value="${response_type}">
            <input type="hidden" name="state" value="${state}">
            <input type="hidden" name="scope" value="${scope}">
            <input type="email" name="email" placeholder="Email">
            <input type="password" name="password" placeholder="Password">
            <button type="submit">Authorize</button>
          </form>
        </div>
      `);
      return;
    }

    res.send(`
      <h1>2Something went wrong!!</h1>
    `);
  } catch (error: any) {
    console.error(error);
    res.send(`
      <h1>1Something went wrong!!</h1>
    `);
  }
};

export const postAuthorizeUser = async (req: Request, res: Response) => {
  try {
    const {
        email,
        password,
        client_id,
        redirect_uri,
        response_type,
        state,
        scope,
      } = req.body,
      selectedUser = await oAuthModal.getUser(email, password);

    if (!selectedUser) {
      return res.status(401).send('Invalid email or password');
    }

    const authorizationCode = crypto.randomBytes(20).toString('hex'),
      ifAuthSaved = await oAuthModal.saveAuthorizationCode(
        authorizationCode,
        client_id,
        redirect_uri,
        selectedUser,
        scope
      );

    if (!ifAuthSaved) {
      res.send(`
        <h1>Something went wrong!!</h1>
      `);
    }

    const redirectUrl = `${redirect_uri}?code=${authorizationCode}&state=${state}`;
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error(error);
    res.send(`
      <h1>Something went wrong!!</h1>
    `);
  }
};

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).send('Invalid authorization');
    }
    const decodedToken: any = oAuthModal.getUserFullInfo(authorization);

    console.log(decodedToken);

    if (decodedToken) {
      const { id, name, email } = decodedToken.user;
      res.status(200).json({ user_id: id, username: name, email });
    } else {
      res
        .status(400)
        .json({ error: 'Either auth token id is not present or not valid' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
