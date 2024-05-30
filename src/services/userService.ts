import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface Client {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

const secretKey = process.env.SECRET_KEY ?? 'Password@123',
  users = [
    { user_id: 1, username: 'user1', password: 'password1' },
    { user_id: 2, username: 'user2', password: 'password2' },
  ],
  clients: Client[] = [{
    clientId: 'client1',
    clientSecret: 'secret1',
    redirectUri: '',
  }];

export const generateToken = async (req: Request, res: Response) => {
  try {
    const { headers, body, query } = req;
    // console.log(headers, body, query)

    const selectedUser = users[0];

    // const { id } = req.query,
    //   selectedUser = users.find((el) => el.id === Number(id));

    if (selectedUser?.username && selectedUser?.password) {
      const payload = { ...selectedUser },
        token = jwt.sign(payload, secretKey, { expiresIn: '24h' });
        console.log(token)

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

export const checkUser = async (req: Request, res: Response) => {
  try {
    const { headers, query, } = req,
      { login_hint, promt, response_type, redirect_uri, state, client_id } = query,
      newParam = {
        ...query,
        nonce: '',
        code: '123456789',
        grant_type: 'authorization_code'
      };

    // console.log(newParam)

    if (clients.find((el) => el.clientId === client_id)) {
      const newUri = redirect_uri + '?' + new URLSearchParams(newParam as any).toString();
      // const newUri = redirect_uri + '?' + new URLSearchParams({code: '1234'}).toString();
      // console.log(newUri);
      res.redirect(newUri);
      return;
    }

    res.send(`
      <h1>Something went wrong!!</h1>
    `);
  } catch (error: any) {
    console.error(error);
    res.send(`
      <h1>Something went wrong!!</h1>
    `);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { headers, body, query } = req,
      { authorization } = headers,
      decodedToken: any = jwt.verify(authorization as string, secretKey);

      console.log(decodedToken);

    if (decodedToken) {
      const { user_id, username } = decodedToken;
      res.status(200).json({ user_id, username, email: '' });
    } else {
      res
        .status(400)
        .json({ error: 'Either auth token id is not present or not valid' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }

}

