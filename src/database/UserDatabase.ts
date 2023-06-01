import { UserDB } from "../models/Users";
import { BaseDataBase } from "./BaseDatabase";

export class UserDataBase extends BaseDataBase {
  public static TABLE_USERS = "users";

  public async findUsers(q: string | undefined): Promise<UserDB[]> {
    let usersDB;

    if (q) {
      const result: UserDB[] = await BaseDataBase.connection(
        UserDataBase.TABLE_USERS
      )
        .select("name")
        .where("name","LIKE", `%${q}%`);

      usersDB = result;
    } else {
      const result: UserDB[] = await BaseDataBase.connection(
        UserDataBase.TABLE_USERS
      );

      usersDB = result;
    }

    return usersDB;
  }

  public async findUserById(id: string): Promise<UserDB | undefined> {
    const [userDB]: UserDB[] | undefined[] = await BaseDataBase.connection(
      UserDataBase.TABLE_USERS
    ).where({ id });

    return userDB;
  }


  public async findUserByEmail(email: string): Promise<UserDB | undefined> {
    const [userDB]: UserDB[] | undefined[] = await BaseDataBase.connection(
      UserDataBase.TABLE_USERS
    ).where({ email });

    return userDB;
  }

  public async insertUser(newUserDB: UserDB): Promise<void> {
    await BaseDataBase.connection(UserDataBase.TABLE_USERS).insert(newUserDB);
  }
}