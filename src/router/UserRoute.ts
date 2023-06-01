import express from "express";
import { UserController } from "../controller/UserController";
import { UserBusiness } from "../business/UserBusiness";
import { UserDataBase } from "../database/UserDatabase";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { HashManager } from "../services/HashManager";
import { LikesDislikesDataBase } from "../database/LikeDislikeDatabase";

export const userRoute = express.Router();
const userController = new UserController(
  new UserBusiness(new UserDataBase(), new IdGenerator(), new TokenManager(), new HashManager(), new LikesDislikesDataBase)
);

userRoute.get("/",userController.getUsers);
userRoute.post("/signup", userController.signup);
userRoute.post("/login", userController.login);

