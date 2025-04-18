import { UserRepositoryImpl } from '../repositories/userRepositoryImpl';
import { CreateUser } from '../../domain/use-cases/createUser';
import { GetUser } from '../../domain/use-cases/getUser';
import { UpdateUser } from '../../domain/use-cases/updateUser';
import { DeleteUser } from '../../domain/use-cases/deleteUser';
import { UserController } from '../../presentation/controllers/userController';

// Initialize repositories
const userRepository = new UserRepositoryImpl();

// Initialize use cases
const createUserUseCase = new CreateUser(userRepository);
const getUserUseCase = new GetUser(userRepository);
const updateUserUseCase = new UpdateUser(userRepository);
const deleteUserUseCase = new DeleteUser(userRepository);

// Initialize controllers
export const userController = new UserController(
  userRepository,
  createUserUseCase,
  getUserUseCase,
  updateUserUseCase,
  deleteUserUseCase
); 