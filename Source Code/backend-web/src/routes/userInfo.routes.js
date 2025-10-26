import express from "express";
import userInfoController from "../controllers/userInfo.controller.js";

const router = express.Router();

router.get("/", userInfoController.getAllUserInfos);

router.get("/:id", userInfoController.getUserInfoById);

router.get("/phone/:phone", userInfoController.getUserInfoByPhone);

router.get("/email/:email", userInfoController.getUserInfoByEmail);

router.post("/", userInfoController.createUserInfo);

router.put("/:id", userInfoController.updateUserInfo);

router.delete("/:id", userInfoController.deleteUserInfo);

export default router;
