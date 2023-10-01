import { create, generateForgetPasswordLink, grantValid, sendReverificationToken, singIn, updatePassword, verifyEmail } from '@/controllers/user';
import { isValidPasswordResetToken, mustAuth } from '@/middleware/auth';
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
router.get('/is-auth', mustAuth, (req, res) => {
  return res.json({ profile: req.user });
});
export default router;