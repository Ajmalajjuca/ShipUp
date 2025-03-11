export class Driver {
    constructor(

        
        public fullName: string,
        public mobileNumber: string,
        public dateOfBirth: string,
        public address: string,
        public email: string,
        public vehicleType: string,
        public registrationNumber: string,

        // Bank Details
        public accountHolderName: string,
        public accountNumber: string,
        public ifscCode: string,
        public upiId: string,

        // Document Paths/URLs after upload
        public aadharPath: string,
        public panPath: string,
        public licensePath: string,
        public insuranceDocPath: string,
        public pollutionDocPath: string,
        public profilePicturePath: string,

        public BankDetails:boolean,
        public VehicleDetails:boolean,
        public PersonalDocuments:boolean,

        public createdAt?: Date,
        public updatedAt?: Date,
    ) { }


}
