import { PostDB } from "./../models/Posts";
import { BaseDataBase } from "./BaseDatabase";

export class PostDataBase extends BaseDataBase {

    private static TABLE_POSTS = "posts";

  public findAllPosts = async (q: string | undefined): Promise<PostDB[]> => {
    if (q) {
      const result: PostDB[] = await BaseDataBase.connection(
        PostDataBase.TABLE_POSTS
      ).where("id", "LIKE", `%${q}%`);

      return result;
    } else {
      const result: PostDB[] = await BaseDataBase.connection(
        PostDataBase.TABLE_POSTS
      );

      return result;
    }
  };

  public async findPostById(id: string): Promise<PostDB | undefined> {
    const [postDB]: PostDB[] | undefined[] = await BaseDataBase.connection(
      PostDataBase.TABLE_POSTS
    ).where({ id });

    return postDB;
  }

  public insertPost = async (newPost: PostDB): Promise<PostDB> => {
    return await BaseDataBase.connection(PostDataBase.TABLE_POSTS).insert(
      newPost
    );
  };


  public async updatePost(idToEdit: string, postDB: PostDB) {
    await BaseDataBase.connection(PostDataBase.TABLE_POSTS)
      .update(postDB)
      .where({ id: idToEdit });
  }

  public async deletePost(idToDelete: string) {
    await BaseDataBase.connection(PostDataBase.TABLE_POSTS)
      .delete()
      .where({ id: idToDelete });
  }
}