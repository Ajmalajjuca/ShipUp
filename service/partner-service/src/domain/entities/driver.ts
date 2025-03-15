export class Driver {
  constructor(
    public partnerId: string, 
    public fullName: string,
    public mobileNumber: string,
    public dateOfBirth: string,
    public address: string,
    public email: string,
    public vehicleType: string,
    public registrationNumber: string,
    public accountHolderName: string,
    public accountNumber: string,
    public ifscCode: string,
    public upiId: string,
    public aadharPath: string,
    public panPath: string,
    public licensePath: string,
    public insuranceDocPath: string,
    public pollutionDocPath: string,
    public profilePicturePath: string,
    public bankDetailsCompleted: boolean = false,
    public vehicleDetailsCompleted: boolean = false,
    public personalDocumentsCompleted: boolean = false,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}