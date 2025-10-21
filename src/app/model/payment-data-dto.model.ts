import { BillData } from "./bill-data.model";
import { CompanyData } from "./company-data.model";

export interface PaymentDataDTO {
  id: number;
  billDTO: BillData;
  paid: number | null;
  partialPaid: number | null;
  paidDate: number | null;
  status: number;
}