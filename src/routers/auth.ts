import { create, generateForgetPasswordLink, grantValid, logout, sendProfile, sendReverificationToken, singIn, updatePassword, updateProfile, verifyEmail } from '@/controllers/auth';
import { isValidPasswordResetToken, mustAuth } from '@/middleware/auth';
import { validate } from '@/middleware/validator';
import { CreateUserSchema, SignInValidationSchema, TokenAndIdValidation, UpdatePasswordSchema } from '@/utils/validationSchema';
import { Router } from 'express';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import fileParser, { RequestWithFiles } from '@/middleware/fileParser';

const router = Router();

router.post("/signup", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIdValidation), verifyEmail);
router.post("/re-verify-email", sendReverificationToken);
router.post("/forget-password", generateForgetPasswordLink);
router.post("/verify-password-reset-token", validate(TokenAndIdValidation), isValidPasswordResetToken, grantValid);
router.post('/update-password', validate(UpdatePasswordSchema), isValidPasswordResetToken, updatePassword);
router.post('/sign-in', validate(SignInValidationSchema), singIn);
router.get('/is-auth', mustAuth, sendProfile);

router.post('/update-profile', mustAuth, fileParser, updateProfile);
router.post('/logout', mustAuth, logout);
export default router;