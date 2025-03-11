import { BankDetailsForm } from "./components/BankDetailsForm";
import { RegistrationForm } from "./components/RegistrationForm";
import { VehicleDetailsForm } from "./components/VehicleDetailsForm";
import { DocumentItem } from "./types";

export const DOCUMENT_STEPS: DocumentItem[] = [
    { id: 'personal', title: 'Personal Documents', isCompleted: false, formComponent: RegistrationForm },
    { id: 'vehicle', title: 'Vehicle Details', isCompleted: false, formComponent: VehicleDetailsForm },
    { id: 'bank', title: 'Bank Details', isCompleted: false, formComponent: BankDetailsForm },
];