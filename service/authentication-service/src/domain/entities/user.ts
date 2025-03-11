export class User {
  constructor(
    public id: string,
    public fullName: string,
    public phone: string,
    public email: string,
    public password: string,
    public referralId: string,
    public isVerified: boolean = false,
    public role: 'user' | 'admin' = 'user', // Added role
    public addresses: string[] = [], // Ensure addresses is included
    public onlineStatus: boolean = false,
    public profilePic?: string
  ) {}
}
