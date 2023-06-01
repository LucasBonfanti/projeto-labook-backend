import { IdGenerator } from "./../services/IdGenerator";
import { PostDataBase } from "../database/PostDatabase";
import { CreatePostInputDTO, CreatePostOutputDTO } from "../dtos/posts/CreatePost.dto";
import { PostDB, Posts } from "../models/Posts";
import { BadRequestError } from "../errors/BadRequestError";
import { GetPostInputDTO, GetPostsOutputDTO } from "../dtos/posts/GetPosts.dtos";
import { DeletePostInputDTO, DeletePostOutputDTO } from "../dtos/posts/DeletePost.dto";
import { LikesDislikesDataBase } from "../database/LikeDislikeDatabase";
import { LikesDislikesDB } from "../models/LikesDislikes";
import { UpdatePostInputDTO, UpdatePostOutputDTO } from "../dtos/posts/UpdatePost.dto";
import { TokenManager } from "../services/TokenManager";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { USER_ROLES } from "../models/Users";

export class PostBusiness {
  constructor(
    private postDataBase: PostDataBase,
    private idGenerator: IdGenerator,
    private likeDataBase: LikesDislikesDataBase,
    private tokenManager: TokenManager
  ) {}

  
  public findAllPosts = async (
    input: GetPostInputDTO
  ): Promise<GetPostsOutputDTO> => {
    const { q } = input;

    const postDB = await this.postDataBase.findAllPosts(q);

    const findPosts = postDB.map((post) => {
      const posts = new Posts(
        post.id,
        post.content,
        post.created_at,
        post.updated_at,
        post.likes,
        post.dislikes,
        post.creator_id
      );
      return posts.toBusinessModel();
    });

    const output: GetPostsOutputDTO = findPosts;
    return output;
  };

  public createPost = async (
    input: CreatePostInputDTO
  ): Promise<CreatePostOutputDTO> => {

    const { token, creatorId, content } = input;

     const payload = await this.tokenManager.getPayload(token);

     if (!payload) {
       throw new UnauthorizedError();
     }


    const id = this.idGenerator.generate();

    const postExist = await this.postDataBase.findPostById(id);
    if (postExist) {
      throw new BadRequestError("'id' já existe");
    }
    
    if (!creatorId) {
      throw new BadRequestError("'creator_id' não existe");
    }
  
    const newPost = new Posts(
      id,
      content,
      new Date().toLocaleString(), 
      new Date().toLocaleString(), 
      0, 
      0, 
      payload.id
    );

    const like: LikesDislikesDB = {
      user_id: newPost.getCreatorId(),
      post_id: newPost.getId(),
      like: newPost.getLikes(),
    };

    const newPostDB = newPost.toDBModel();
    await this.postDataBase.insertPost(newPostDB);

    await this.likeDataBase.createLikePost(like);

    const output: CreatePostOutputDTO = {
      message: "Postado com sucesso!",
      post: newPost.toBusinessModel(),
    };
    return output;
  };

  public updatePost = async (
    input: UpdatePostInputDTO
  ): Promise<UpdatePostOutputDTO> => {
    const { token, idPostToEdit, content } = input;

    const payload = await this.tokenManager.getPayload(token);

    if (!payload) {
      throw new UnauthorizedError();
    }

    const postExist = await this.postDataBase.findPostById(idPostToEdit);
    if (!postExist) {
      throw new NotFoundError("id não encontrado.");
    }
    if (payload.id !== postExist.creator_id) {
      throw new ForbiddenError("Apenas o criador pode editar o post.");
    }

    const newPost = new Posts(
      postExist.id,
      postExist.content,
      postExist.created_at,
      postExist.updated_at,
      postExist.likes,
      postExist.dislikes,
      payload.id
    );

    newPost.setContent(content);

    newPost.setUpdatedAt(new Date().toLocaleString());

    const updatedNewPost = newPost.toDBModel();

    await this.postDataBase.updatePost(idPostToEdit, updatedNewPost);

    const output: UpdatePostOutputDTO = {
      message: "Update de post realizado!",
      post: newPost.toBusinessModel(),
    };
    return output;
  };

  public deletePost = async (
    input: DeletePostInputDTO
  ): Promise<DeletePostOutputDTO> => {
    const { idToDelete, token } = input;

    const payload = await this.tokenManager.getPayload(token);

    if (!payload) {
      throw new UnauthorizedError();
    }

    const postExist = await this.postDataBase.findPostById(idToDelete);
    if (!postExist) {
      throw new NotFoundError("id não encontrado.");
    }

    if (payload.role !== USER_ROLES.ADMIN) {
      if (payload.id !== postExist.creator_id) {
        throw new ForbiddenError("Criador ou administrador pode deletar este post.");
      }
    }

    await this.postDataBase.deletePost(idToDelete);

    const output: DeletePostOutputDTO = {
      message: "Post excluído.",
    };
    return output;
  };
}