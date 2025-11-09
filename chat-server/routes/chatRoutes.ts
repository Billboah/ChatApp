import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  addMemberController,
  changeGroupIconController,
  changeGroupNameController,
  getAllChatController,
  removeMemberController,
} from "../controllers/chatController";

const router: Router = Router();

router.get("/", authenticate, getAllChatController);

router.put("/rename", authenticate, changeGroupNameController);

router.put("/changeIcon", authenticate, changeGroupIconController);

router.put("/groupRemove", authenticate, removeMemberController);

router.put("/groupadd", authenticate, addMemberController);

export default router;
