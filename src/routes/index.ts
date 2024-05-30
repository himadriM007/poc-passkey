import { Router } from 'express';
import { checkUser, generateToken, getProfile } from '../services';

const router = Router();

// Users
router.route('/oauth/authorize').get(checkUser);
router.route('/get-profile').get(getProfile);
router.route('/oauth/token').post(generateToken);

export default router;
