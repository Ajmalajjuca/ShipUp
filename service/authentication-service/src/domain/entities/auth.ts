export class Auth {
    constructor(
      public userId: string,
      public email: string,
      public role: 'user' | 'driver' | 'admin',
      public password?: string,
    ) {}
  }