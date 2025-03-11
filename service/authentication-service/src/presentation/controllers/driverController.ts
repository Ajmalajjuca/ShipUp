import { Request, Response } from 'express';
import { RegisterDriverUseCase } from '../../domain/use-cases/driver/RegisterDriver';
import { LoginDriver } from '../../domain/use-cases/driver/loginDriver';
import { Driver } from '../../domain/entities/driver';
import { VerifyOtp } from '../../domain/use-cases/user/verifyOtp';
import { DriverRepositoryImpl } from '../../infrastructure/repositories/driverRepositoryImpl';
import {FileStorageServiceImpl} from '../../application/services/fileStorageServiceImpl'
import { OtpService } from '../../application/services/otpService';
import { EmailService } from '../../application/services/emailService';
import { verify } from 'crypto';
import { VerifyDriverUseCase } from "../../domain/use-cases/driver/VerifyDriver";

const driverRepository = new  DriverRepositoryImpl()
const fileStorageService = new FileStorageServiceImpl()
const otpService = new OtpService();
const emailService = new EmailService();

const verifyDriverUseCase = new VerifyDriverUseCase(driverRepository);
const registerDriver = new RegisterDriverUseCase(driverRepository,fileStorageService);
const loginDriver = new LoginDriver(driverRepository,otpService,emailService)


export const DriverController= {
   

     registerDriver:async(req: Request, res: Response): Promise<void>=> {
        try {
            const files = req.files as {
                aadhar: Express.Multer.File[],
                pan: Express.Multer.File[],
                license: Express.Multer.File[],
                insuranceDoc: Express.Multer.File[],
                pollutionDoc: Express.Multer.File[],
                profilePicture: Express.Multer.File[]
            };

            const registerDriverDTO = {
                ...req.body,
                aadhar: files.aadhar[0],
                pan: files.pan[0],
                license: files.license[0],
                insuranceDoc: files.insuranceDoc[0],
                pollutionDoc: files.pollutionDoc[0],
                profilePicture: files.profilePicture[0]
            };

            const result = await registerDriver.execute(registerDriverDTO);

            if (!result.success) {
                res.status(401).json({ error: result.error });
                return;
            }

            const driver = result.driver as Driver;

            res.status(201).json({
                status: 'success',
                data: {
                    driver
                }
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(400).json({
                status: 'error',
                message: errorMessage
            });
        }
    },

     sendOtp: async(req: Request, res: Response): Promise<void> =>{
        try {
          const { email } = req.body;
          
          
          if (!email) {
            res.status(400).json({ success: false, message: 'Email is required' });
            return;
          }
          
          const result = await loginDriver.execute(email);
          
          if (result.success) {
            res.status(200).json(result);
            const driver = result.driver as Driver
            const otp: string = result.otp ?? ''
            otpService.storeOtp(email,otp,driver)

          } else {
            res.status(404).json('otp sending error');
          }
        } catch (error) {
          console.error('Error in send OTP controller:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
          });
        }
      },
      
      verifyOtp: async(req: Request, res: Response): Promise<void> =>{
        try {
          const { email, otp } = req.body;
          
          
          if (!email || !otp) {
            res.status(400).json({ 
              success: false, 
              message: 'Email and OTP are required' 
            });
            return;
          }
          
          const{ isValid, user } = await otpService.verifyOtp(email, otp);
          
          
          if (isValid||user) {
            res.status(200).json({ 
              success: true, 
              message: 'OTP verification secsuss' 
            });
          } else {
            res.status(400).json(user);
          }
        } catch (error) {
          console.error('Error in verify OTP controller:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
          });
        }
      },
      
     resendOtp: async(req: Request, res: Response): Promise<void> =>{
        try {
          const { email } = req.body;
          
          if (!email) {
            res.status(400).json({ success: false, message: 'Email is required' });
            return;
          }
          
          const result = await loginDriver.execute(email);
          
          if (result.success) {
            res.status(200).json(result);
          } else {
            res.status(404).json(result);
          }
        } catch (error) {
          console.error('Error in resend OTP controller:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
          });
        }
      },
      verifydoc: async(req:Request,res:Response):Promise<void>=>{
        try {
          const { email } = req.query;
    
          if (typeof email !== "string") {
            res.status(400).json({ success: false, message: "Invalid email format" });
            return;
          }
    
          const result = await verifyDriverUseCase.execute(email);
          console.log('result>>',result);
          
          res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
          res.status(500).json({ success: false,  });
        }
      }
}