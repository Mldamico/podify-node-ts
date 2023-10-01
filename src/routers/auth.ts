import { create, generateForgetPasswordLink, grantValid, sendReverificationToken, singIn, updatePassword, verifyEmail } from '@/controllers/user';
import { isValidPasswordResetToken } from '@/middleware/auth';
import { validate } from '@/middleware/validator';
import { CreateUserSchema, SignInValidationSchema, TokenAndIdValidation, UpdatePasswordSchema } from '@/utils/validationSchema';
import { Router } from 'express';

const router = Router();

router.post("/signup", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIdValidation), verifyEmail);
router.post("/re-verify-email", sendReverificationToken);
router.post("/forget-password", generateForgetPasswordLink);
router.post("/verify-password-reset-token", validate(TokenAndIdValidation), isValidPasswordResetToken, grantValid);
router.post('/update-password', validate(UpdatePasswordSchema), isValidPasswordResetToken, updatePassword);
router.post('/sign-in', validate(SignInValidationSchema), singIn);

export default router;