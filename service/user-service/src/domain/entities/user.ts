export class User {
  constructor(
    public userId: string,
    public fullName: string,
    public phone: string,
    public email: string,
    public addresses: string[],
    public onlineStatus: boolean,
    public isVerified: boolean,
    public referralId: string,
    public status:boolean,
    public profileImage?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}