import { UserRepositoryImpl } from '../repositories/userRepositoryImpl';
import { AddressRepositoryImpl } from '../repositories/addressRepositoryImpl';
import { CreateUser } from '../../domain/use-cases/createUser';
import { GetUser } from '../../domain/use-cases/getUser';
import { UpdateUser } from '../../domain/use-cases/updateUser';
import { DeleteUser } from '../../domain/use-cases/deleteUser';
import { UserController } from '../../presentation/controllers/userController';
import { AddAddress } from '../../domain/use-cases/addAddress';

// Initialize repositories
const userRepository = new UserRepositoryImpl();
const addressRepository = new AddressRepositoryImpl();

// Initialize use cases
const createUserUseCase = new CreateUser(userRepository);
const getUserUseCase = new GetUser(userRepository);
const updateUserUseCase = new UpdateUser(userRepository);
const deleteUserUseCase = new DeleteUser(userRepository);
const addAddressUseCase = new AddAddress(addressRepository, userRepository);

// Initialize controllers
export const userController = new UserController(
  userRepository,
  createUserUseCase,
  getUserUseCase,
  updateUserUseCase,
  deleteUserUseCase,
  addressRepository,
  addAddressUseCase
); 