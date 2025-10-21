import { BeneficiaryData } from "./beneficiary-data.model";

export interface ActiveData {
  checkbox?: boolean;
  id: number;
  beneficiaryDTO: BeneficiaryData;
  endDate: Date | null,
  value: number | null;
  statusActive: number;
}