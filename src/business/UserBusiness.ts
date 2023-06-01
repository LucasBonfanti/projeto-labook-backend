import { GetUsersInputDTO,GetUsersOutputDTO } from "./../dtos/users/GetUsers.dto";
  import { IdGenerator } from "../services/IdGenerator";
  import { TokenManager, TokenPayload } from "../services/TokenManager";
  import { UserDataBase } from "./../database/UserDatabase";
  import { USER_ROLES, User } from "../models/Users";
  import { SignupInputDTO, SignupOutputDTO } from "../dtos/users/Signup.dto";
  import { BadRequestError } from "../errors/BadRequestError";
  import { LoginInputDTO, LoginOutputDTO } from "../dtos/users/Login.dto";
  import { NotFoundError } from "../errors/NotFoundError";
  import { HashManager } from "../services/HashManager";
  import { LikesDislikesDataBase } from "../database/LikeDislikeDatabase";
  
  export class UserBusiness {
    constructor(
      private userDatabase: UserDataBase,
      private idgenerator: IdGenerator,
      private tokenManager: TokenManager,
      private hashManager: HashManager,
      private likeDataBase: LikesDislikesDataBase
    ) {}
  
    public getUsers = async (
      input: GetUsersInputDTO
    ): Promise<GetUsersOutputDTO> => {
      const { q, token } = input;
      const payload = await this.tokenManager.getPayload(token);
  
      if (payload === null) {
        throw new NotFoundError("Token inválido");
      }
      if (payload.role !== USER_ROLES.ADMIN) {
        throw new BadRequestError("Acesso para administratores.");
      }
      const usersDB = await this.userDatabase.findUsers(q);
  
      const users = usersDB.map((userDB) => {
        const user = new User(
          userDB.id,
          userDB.name,
          userDB.email,
          userDB.password,
          userDB.role,
          userDB.created_at
        );
  
        return user.toBusinessModel();
      });
  
      const output: GetUsersOutputDTO = users;
  
      return output;
    };
  
    public signup = async (input: SignupInputDTO): Promise<SignupOutputDTO> => {

    const { name, email, password } = input;
  
      const id = this.idgenerator.generate();

      const hashPassword = await this.hashManager.hash(password);
  
      const userDBExists = await this.userDatabase.findUserById(id);

      if (userDBExists) {
        throw new BadRequestError("id já cadastrada");
      }

      const emailExist = await this.userDatabase.findUserByEmail(email);
      if (emailExist) {
        throw new BadRequestError("Email já cadastrado");
      }

      const newUser = new User(
        id,
        name,
        email,
        hashPassword,
        USER_ROLES.ADMIN, 
        new Date().toISOString() 
      );
  
      const newUserDB = newUser.toDBModel();
  
      await this.userDatabase.insertUser(newUserDB);
  
      const tokenPayload: TokenPayload = {
        id: newUser.getId(),
        name: newUser.getName(),
        role: newUser.getRole(),
      };

      const token = this.tokenManager.createToken(tokenPayload);

      const output: SignupOutputDTO = {
        message: "Seu cadastro foi realizado!",
        token: token,
      };
  
      return output;
    };
  
    public login = async (input: LoginInputDTO): Promise<LoginOutputDTO> => {

        const { email, password } = input;

        const userDB = await this.userDatabase.findUserByEmail(email);

        if (!userDB) {
        throw new NotFoundError("Email não encontrado.");
      }

      const passwordCompare = await this.hashManager.compare(
        password,
        userDB.password
      );
  
      if (!passwordCompare) {
        throw new BadRequestError("Seu email ou senha são inválidos");
      }
      const user = new User(
        userDB.id,
        userDB.name,
        userDB.email,
        userDB.password,
        userDB.role,
        userDB.created_at
      );
  
      const tokenPayload: TokenPayload = {
        id: user.getId(),
        name: user.getName(),
        role: user.getRole(),
      };
  
      const token = this.tokenManager.createToken(tokenPayload);
  
      const output: LoginOutputDTO = {
        message: "Você está logado!",
        token: token,
      };
  
      return output;
    };
  
  }