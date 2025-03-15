export class User {
    constructor(
      public userId: string,
      public fullName: string,
      public phone: string,
      public email: string,
      public addresses: string[] = [],
      public onlineStatus:boolean=false,
      public isVerified: boolean=false,
      public referralId: string,
      public profilePic?: string,
    ) {}
  }