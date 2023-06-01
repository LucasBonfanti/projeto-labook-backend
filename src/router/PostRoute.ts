import express from "express";
import { PostController } from "../controller/PostController";
import { PostBusiness } from "../business/PostBusiness";
import { PostDataBase } from "../database/PostDatabase";
import { IdGenerator } from "../services/IdGenerator";
import { LikesDislikesDataBase } from "../database/LikeDislikeDatabase";
import { TokenManager } from "../services/TokenManager";

export const postRoute = express.Router();

const postController = new  PostController( new PostBusiness ( new PostDataBase, new IdGenerator, new LikesDislikesDataBase  , new TokenManager))
postRoute.get('/',postController.findAllPosts)
postRoute.post('/',postController.createPost)
postRoute.put('/:id', postController.updatePost)
postRoute.delete('/:id', postController.deletePost)