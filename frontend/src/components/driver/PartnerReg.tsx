import { useState } from 'react';
import { DriverRegistrationData } from './types';
import { DOCUMENT_STEPS } from './constants';
import RegistrationLayout from './components/RegistrationLayout';
import { DocumentChecklist } from './components/DocumentChecklist';
import { PersonalDocuments } from './components/PersonalDocuments';
import { DocumentUpload } from './components/DocumentUpload';
import DocumentLayout from './components/DocumentLayout';
import { VehicleDetailsForm } from './components/VehicleDetailsForm';
import { BankDetailsForm } from './components/BankDetailsForm';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

const PartnerReg = () => {
    const [currentStep, setCurrentStep] = useState<string>('registration');
    const [formData, setFormData] = useState<Partial<DriverRegistrationData>>({});
    const [selectedDocument, setSelectedDocument] = useState<string>('');
    const [completedDocuments, setCompletedDocuments] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const navigate = useNavigate()
    const handleFormSubmit = (data: Partial<DriverRegistrationData>) => {
        if (!data.fullName || !data.mobileNumber || !data.dateOfBirth || !data.email || !data.address) {
            return; // Form validation will be handled in RegistrationForm
        }
        setFormData(prev => ({ ...prev, ...data }));
        setCompletedDocuments(prev => [...prev, 'personal']);
        setCurrentStep('documents');
    };

    const handleDocumentClick = (documentId: string) => {
        switch (documentId) {
            case 'documents':
                setCurrentStep('personal-documents');
                break;
            case 'personal':
                // Don't navigate when clicking completed personal info
                break;
            case 'vehicle':
                setCurrentStep('vehicle-details');
                break;
            case 'bank':
                setCurrentStep('bank-details');
                break;
            default:
                setSelectedDocument(documentId);
                setCurrentStep(documentId);
        }
    };

    const handleDocumentUpload = (files: File[]) => {
        if (!files.length) return;

        // Store document in formData
        setFormData(prev => ({
            ...prev,
            [selectedDocument]: files[0]
        }));

        // Handle document completion status
        setCompletedDocuments(prev => {
            const newCompleted = [...prev, selectedDocument];

            // Check if all personal documents are completed
            const requiredDocs = ['aadhar', 'pan', 'license'];
            const allPersonalDocsCompleted = requiredDocs.every(doc =>
                newCompleted.includes(doc)
            );

            // If all personal docs are completed, mark the documents section as completed
            if (allPersonalDocsCompleted && !newCompleted.includes('documents')) {
                return [...newCompleted, 'documents'];
            }

            return newCompleted;
        });

        setCurrentStep('personal-documents');
    };

    const handleBack = () => {
        setCurrentStep('documents');
    };

    const submitToBackend = async (data: Partial<DriverRegistrationData>) => {
        setIsSubmitting(true);
        setSubmitError(null);

        // Create FormData object to handle file uploads
        const formDataToSend = new FormData();

        // Append all non-file data
        Object.entries(data).forEach(([key, value]) => {
            if (value instanceof File) {
                formDataToSend.append(key, value);
            } else if (value !== undefined && value !== null) {
                formDataToSend.append(key, String(value));
            }
        });

        try {
            const response = await axios.post('http://localhost:3003/api/drivers', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            

            if (response.data.status === "success") {

                setCurrentStep('verification');
            } else {
                setSubmitError('Registration failed. Please try again.');
            }
        } catch (error: any) {
            setSubmitError(
                ((error as AxiosError)?.response?.data as { message?: string })?.message ||
                'An error occurred while submitting your application. Please try again.'
            );
            alert(`Error: ${error.response?.data?.error || 'Something went wrong!'}`);

        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextClick = () => {
        const requiredDocuments = ['aadhar', 'pan', 'license'];
        const allDocumentsCompleted = requiredDocuments.every(doc =>
            completedDocuments.includes(doc)
        );

        if (allDocumentsCompleted) {
            submitToBackend(formData);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 'registration':
                return <RegistrationLayout onSubmit={handleFormSubmit} />;

            case 'documents':
                return (
                    <DocumentLayout title="Required Documents">
                        <DocumentChecklist
                            onDocumentClick={handleDocumentClick}
                            onNextClick={handleNextClick}
                            completedDocuments={completedDocuments}
                        />
                    </DocumentLayout>
                );

            case 'personal-documents':
                return (
                    <DocumentLayout
                        title="Personal Documents"
                        subtitle="Upload focused photos of below documents for faster verification"
                        onBack={handleBack}
                    >
                        <PersonalDocuments
                            onDocumentClick={(docType) => {
                                setSelectedDocument(docType);
                                setCurrentStep('document-upload');
                            }}
                            completedDocuments={completedDocuments}
                        />
                    </DocumentLayout>
                );

            case 'document-upload':
                return (
                    <DocumentLayout
                        title={`Upload ${selectedDocument}`}
                        subtitle="Please ensure the document is clearly visible"
                        onBack={() => setCurrentStep('personal-documents')}
                    >
                        <DocumentUpload
                            documentType={selectedDocument}
                            onSubmit={handleDocumentUpload}

                        />
                    </DocumentLayout>
                );

            case 'vehicle-details':
                return (
                    <DocumentLayout
                        title="Vehicle Details"
                        subtitle="Enter your vehicle information"
                        onBack={handleBack}
                    >
                        <VehicleDetailsForm
                            initialData={formData}
                            onSubmit={(data) => {
                                setFormData(prev => ({ ...prev, ...data }));
                                setCompletedDocuments(prev => [...prev, 'vehicle']);
                                setCurrentStep('documents');
                            }}
                            onBack={handleBack}
                        />
                    </DocumentLayout>
                );

            case 'bank-details':
                return (
                    <DocumentLayout
                        title="Bank Account Details"
                        subtitle="Enter your bank account information"
                        onBack={handleBack}
                    >
                        <BankDetailsForm
                            initialData={formData}
                            onSubmit={(data) => {
                                setFormData(prev => ({ ...prev, ...data }));
                                setCompletedDocuments(prev => [...prev, 'bank']);
                                setCurrentStep('documents');
                            }}
                            onBack={handleBack}
                        />
                    </DocumentLayout>
                );

            case 'verification':
                return (
                    <DocumentLayout title="Verification Status">
                        <div className="p-4">
                            {submitError ? (
                                <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
                                    <h3 className="font-semibold mb-2">Submission Error</h3>
                                    <p className="text-sm">{submitError}</p>
                                    <button
                                        onClick={() => submitToBackend(formData)}
                                        className="mt-3 text-sm text-red-600 hover:text-red-800"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 text-gray-800 p-4 rounded-lg mb-6">
                                    <h3 className="font-semibold mb-2">Your application is under review</h3>
                                    <p className="text-sm">Our team will verify your documents within 48hrs</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                    <span>{'Personal information'}</span>
                                    <span className="text-sm text-green-600">
                                        {'Approved'}
                                    </span>
                                </div>
                                {DOCUMENT_STEPS.map(doc => (

                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                        <span>{doc.title}</span>
                                        <span className="text-sm text-yellow-600">
                                            {isSubmitting ? 'Submitting...' : 'Verification Pending'}
                                        </span>
                                    </div>

                                ))}
                            </div>

                            <div className="mt-6 text-center">
                                <a href="#" className="text-red-500 text-sm">Need Help? Contact Us</a>
                            </div>
                            <div className="mt-4 text-center">
                                <button onClick={()=>navigate('/partner')}

                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Go to Login
                                </button>
                            </div>
                        </div>
                    </DocumentLayout>
                );

            default:
                return null;
        }
    };

    return <>{renderStep()}</>;
};

export default PartnerReg;