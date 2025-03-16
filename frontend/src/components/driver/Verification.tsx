import axios from 'axios';
import DocumentLayout from './components/DocumentLayout';
import { DOCUMENT_STEPS } from './constants';
import { useEffect, useState, useMemo } from 'react';
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { useNavigate } from 'react-router-dom';
import DeliveryPartnerDashboard from './components/DeliveryPartnerDashboard';
import { LogOut } from 'lucide-react';
import { sessionManager } from '../../utils/sessionManager';
import { toast } from 'react-hot-toast';

const Verification = () => {
    const emailId = useSelector((state: RootState) => state.driver.emailId);
    const navigate = useNavigate();
    
    type VerificationData = {
        BankDetails: boolean;
        PersonalDocuments: boolean;
        VehicleDetails: boolean;
        [key: string]: boolean;
    };

    const [verificationData, setVerificationData] = useState<VerificationData>({
        BankDetails: false,
        PersonalDocuments: false,
        VehicleDetails: false
    });

    const handleLogout = () => {
        try {
            sessionManager.clearDriverSession();
            toast.success('Logged out successfully');
            navigate('/partner');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    const getData = async () => {
        if (!emailId) {
            console.log('No email found, redirecting to login');
            navigate('/partner');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:3003/api/drivers/verify-doc?email=${emailId}`);
            const data = response.data?.data || {};
            
            setVerificationData({
                BankDetails: data?.BankDetails || false,
                PersonalDocuments: data?.PersonalDocuments || false,
                VehicleDetails: data?.VehicleDetails || false
            });
        } catch (error) {
            console.error('Error fetching verification data:', error);
            toast.error('Failed to fetch verification status');
        }
    };
    
    useEffect(() => {
        getData();
    }, [emailId, navigate]);

    const isVerified = useMemo(() => (
        verificationData.BankDetails && verificationData.PersonalDocuments && verificationData.VehicleDetails
    ), [verificationData]);

    return (
        <div>
            {isVerified ? (
                <DeliveryPartnerDashboard />
            ) : (
                <DocumentLayout title="Verification Status">
                    <div className="p-4">
                        <div className="bg-yellow-50 text-gray-800 p-4 rounded-lg mb-6">
                            <h3 className="font-semibold mb-2">Your application is under review</h3>
                            <p className="text-sm">Our team will verify your documents within 48hrs</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                <span>Personal information</span>
                                <span className="text-sm text-green-600">Approved</span>
                            </div>

                            {DOCUMENT_STEPS.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                    <span>{doc.title}</span>
                                    <span className={`text-sm ${verificationData[doc.id] ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {verificationData[doc.id] ? 'Approved' : 'Verification Pending'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 text-center">
                            <button 
                                className="text-red-500 text-sm hover:text-red-600"
                                onClick={() => {
                                    window.open('mailto:support@shipup.com', '_blank');
                                    toast('Support email: support@shipup.com');
                                }}
                            >
                                Need Help? Contact Support
                            </button>
                        </div>

                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </DocumentLayout>
            )}
        </div>
    );
};

export default Verification;