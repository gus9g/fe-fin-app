import { BillData } from "./bill-data.model";
import { CompanyData } from "./company-data.model";

export interface PaymentData {
  id: number;
  company: CompanyData
  endDate: Date | null;
  validate: Date | null;
  value: number | null;
  paid: number;
  partialPaid: number;
  paidDate: Date;
  status: number;
}