import { CompanyComponent } from "../component/company/company";
import { CompanyData } from "./company-data.model";

export interface BillData {
  checkbox?: boolean;
  id: number;
  company: CompanyData
  endDate: Date | null;
  validate: Date | null;
  value: number | null;
  status: number;
}