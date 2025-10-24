import express from "express";
import userInfoController from "../controllers/userInfo.controller.js";

const router = express.Router();

// GET all user infos
router.get("/", userInfoController.getAllUserInfos);

// GET user info by ID
router.get("/:id", userInfoController.getUserInfoById);

// GET user info by phone
router.get("/phone/:phone", userInfoController.getUserInfoByPhone);

// GET user info by email
router.get("/email/:email", userInfoController.getUserInfoByEmail);

// POST create new user info
router.post("/", userInfoController.createUserInfo);

// PUT update user info
router.put("/:id", userInfoController.updateUserInfo);

// DELETE user info
router.delete("/:id", userInfoController.deleteUserInfo);

export default router;
