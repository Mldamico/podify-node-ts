import {
  getPublicPlaylist,
  getPublicProfile,
  getPublicUploads,
  getRecommendedByProfile,
  getUploads,
  updateFollower,
} from "@/controllers/profile";
import { isAuth, mustAuth } from "@/middleware/auth";
import { Router } from "express";

const router = Router();

router.post("/update-follower/profileId", mustAuth, updateFollower);
router.get("/uploads", mustAuth, getUploads);
router.get("/uploads/:profileId", getPublicUploads);
router.get("/info/uploads/:profileId", getPublicProfile);
router.get("/paylist/:profileId", getPublicPlaylist);
router.get("/recommended", isAuth, getRecommendedByProfile);
export default router;
