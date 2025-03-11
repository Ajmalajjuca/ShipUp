export interface DriverRegistrationData {
    // Personal Info
    fullName: string;
    dateOfBirth: string;
    mobileNumber: string;
    email: string;
    address: string;
    profilePicture: File | null;
  
    // Vehicle Details
    vehicleType: string;
    registrationNumber: string;
    vehicleMake: string;
    vehicleModel: string;
    manufacturingYear: string;
    insuranceDoc: File | null;
    pollutionDoc: File | null;
    registrationDoc: File | null;
    permitDoc: File | null;
  
    // Bank Details
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    upiId?: string;
  
    // Document Status
    documents?: {
      aadhar?: File;
      pan?: File;
      license?: File;
    };
  }
  
  export interface DocumentItem {
    id: string;
    title: string;
    isCompleted: boolean;
    formComponent: React.FC<any>;
  }