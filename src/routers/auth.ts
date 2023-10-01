import { create, generateForgetPasswordLink, grantValid, sendReverificationToken, singIn, updatePassword, verifyEmail } from '@/controllers/user';
import { isValidPasswordResetToken } from '@/middleware/auth';
import { validate } from '@/middleware/validator';
import User from '@/models/user';
import { CreateUserSchema, SignInValidationSchema, TokenAndIdValidation, UpdatePasswordSchema } from '@/utils/validationSchema';
import { JWT_SECRET } from '@/utils/variables';
import { Router } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

const router = Router();

router.post("/signup", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIdValidation), verifyEmail);
router.post("/re-verify-email", sendReverificationToken);
router.post("/forget-password", generateForgetPasswordLink);
router.post("/verify-password-reset-token", validate(TokenAndIdValidation), isValidPasswordResetToken, grantValid);
router.post('/update-password', validate(UpdatePasswordSchema), isValidPasswordResetToken, updatePassword);
router.post('/sign-in', validate(SignInValidationSchema), singIn);
router.get('/is-auth', async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.split('Bearer ')[1];

  if (!token) return res.json(403).json({ error: "Unauthorized request!" });
  const payload = verify(token, JWT_SECRET) as JwtPayload;

  if (!payload) return res.json(403).json({ error: "Unauthorized request!" });

  const id = payload.userId;
  const user = await User.findById(id);
  if (!user) return res.json(403).json({ error: "Unauthorized request!" });

  return res.json({ profile: { id: user._id, name: user.name, email: user.email, verified: user.verified, avatar: user.avatar?.url, followers: user.followers.length, followings: user.followings.length } });

});
export default router;