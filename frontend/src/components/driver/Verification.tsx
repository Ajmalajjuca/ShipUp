import axios from 'axios';
import DocumentLayout from './components/DocumentLayout';
import { DOCUMENT_STEPS } from './constants';
import { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { useNavigate } from 'react-router-dom';

const Verification = () => {
    const email = useSelector((state: RootState) => state.driver.email);
    type VerificationData = {
        [key: string]: boolean;
        BankDetails: boolean;
        PersonalDocuments: boolean;
        VehicleDetails: boolean;
    };

    const [verificationData, setVerificationData] = useState<VerificationData>({
        BankDetails: false,
        PersonalDocuments: false,
        VehicleDetails: false
    });
const navigate = useNavigate()
    useEffect(() => {
        if (!email) return;

        const getData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/drivers/verify-doc?email=${email}`);

                setVerificationData({
                    BankDetails: response.data.data.BankDetails || false,
                    PersonalDocuments: response.data.data.PersonalDocuments || false,
                    VehicleDetails: response.data.data.VehicleDetails || false
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        getData();
    }, [email]);
    console.log('verificationData>>', verificationData);

    return (
        <div>
            <DocumentLayout title="Verification Status">
                <div className="p-4">
                    <div className="bg-yellow-50 text-gray-800 p-4 rounded-lg mb-6">
                        <h3 className="font-semibold mb-2">Your application is under review</h3>
                        <p className="text-sm">Our team will verify your documents within 48hrs</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                            <span>Personal information</span>
                            <span className={`text-sm  text-green-600 `}>
                                {'Approved'}
                            </span>
                        </div>
                        {DOCUMENT_STEPS.map(doc => (

                            <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                <span>{doc.title}</span>
                                <span className={`text-sm ${verificationData[doc.id as keyof typeof verificationData] ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {verificationData[doc.id as keyof typeof verificationData] ? 'Approved' : 'Verification Pending'}

                                </span>
                            </div>
                        ))}

                        {/* <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                            <span>Bank Details</span>
                            <span className={`text-sm ${verificationData.BankDetails ? 'text-green-600' : 'text-yellow-600'}`}>
                                {verificationData.BankDetails ? 'Approved' : 'Verification Pending'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                            <span>Vehicle Details</span>
                            <span className={`text-sm ${verificationData.VehicleDetails ? 'text-green-600' : 'text-yellow-600'}`}>
                                {verificationData.VehicleDetails ? 'Approved' : 'Verification Pending'}
                            </span>
                        </div> */}
                    </div>

                    <div className="mt-6 text-center">
                        <a href="#" className="text-red-500 text-sm">Need Help? Contact Us</a>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={()=>navigate('/Partner')}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition-all"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </DocumentLayout>
        </div>
    );
};

export default Verification;
