import { Driver } from "../entities/driver";

export interface DriverRepository {
    create(driver: Driver): Promise<Driver>;
    findById(id: string): Promise<Driver | null>;
    findByMobileNumber(mobileNumber: string): Promise<Driver | null>;
    findByEmail(email: string): Promise<Driver | null>;
    updateOtp(email: string, otp: string, otpExpiry: Date): Promise<boolean>;
    verifyOtp(email: string, otp: string): Promise<Driver | null>;
}