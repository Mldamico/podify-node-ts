import { create, generateForgetPasswordLink, isValidPasswordResetToken, sendReverificationToken, verifyEmail } from '@/controllers/user';
import { validate } from '@/middleware/validator';
import { CreateUserSchema, TokenAndIdValidation } from '@/utils/validationSchema';
import { Router } from 'express';

const router = Router();

router.post("/signup", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIdValidation), verifyEmail);
router.post("/re-verify-email", sendReverificationToken);
router.post("/forget-password", generateForgetPasswordLink);
router.post("/verify-password-reset-token", validate(TokenAndIdValidation), isValidPasswordResetToken);

export default router;