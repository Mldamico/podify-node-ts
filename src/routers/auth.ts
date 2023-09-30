import { create, verifyEmail } from '@/controllers/user';
import { validate } from '@/middleware/validator';
import { CreateUserSchema, EmailVerificationBody } from '@/utils/validationSchema';
import { Router } from 'express';

const router = Router();

router.post("/signup", validate(CreateUserSchema), create);
router.post("/verify-email", validate(EmailVerificationBody), verifyEmail);

export default router;