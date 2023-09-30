import { create, generateForgetPasswordLink, grantValid, sendReverificationToken, updatePassword, verifyEmail } from '@/controllers/user';
import { isValidPasswordResetToken } from '@/middleware/auth';
import { validate } from '@/middleware/validator';
import { CreateUserSchema, TokenAndIdValidation, UpdatePasswordSchema } from '@/utils/validationSchema';
import { Router } from 'express';

const router = Router();

router.post("/signup", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIdValidation), verifyEmail);
router.post("/re-verify-email", sendReverificationToken);
router.post("/forget-password", generateForgetPasswordLink);
router.post("/verify-password-reset-token", validate(TokenAndIdValidation), isValidPasswordResetToken, grantValid);
router.post('/update-password', validate(UpdatePasswordSchema), isValidPasswordResetToken, updatePassword);

export default router;