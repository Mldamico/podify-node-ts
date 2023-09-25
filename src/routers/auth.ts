import User from '@/models/user';
import { CreateUser } from '@/types/user';
import { Router } from 'express'

const router = Router();

router.post("/signup", async (req: CreateUser, res) => {
  const { email, password, name } = req.body;

  const user = await User.create({ name, email, password })

  res.json({ user })
})

export default router;