import { Router } from 'express';
import {
  getAuthorizeUser,
  postAuthorizeUser,
  generateToken,
  getUserInfo,
} from '../services';

const router = Router();

// Users
router.route('/authorize').get(getAuthorizeUser);
router.route('/authorize').post(postAuthorizeUser);

router.route('/userinfo').get(getUserInfo);

router.route('/token').post(generateToken);

export default router;
