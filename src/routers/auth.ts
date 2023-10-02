import { create, generateForgetPasswordLink, grantValid, sendReverificationToken, singIn, updatePassword, verifyEmail } from '@/controllers/user';
import { isValidPasswordResetToken, mustAuth } from '@/middleware/auth';
import { validate } from '@/middleware/validator';
import { CreateUserSchema, SignInValidationSchema, TokenAndIdValidation, UpdatePasswordSchema } from '@/utils/validationSchema';
import { Router } from 'express';
import formidable from 'formidable';

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

router.post('/update-profile', (req, res) => {
  if (!req.headers["content-type"]?.startsWith("multipart/form-data")) return res.status(422).json({ error: "Error with content type header" });
  const form = formidable();
  form.parse(req, (err, fields, files) => {
    res.json({ uploaded: true });
  });
});
export default router;