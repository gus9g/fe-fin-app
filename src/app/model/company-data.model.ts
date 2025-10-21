export interface CompanyData {
  checkbox?: boolean;
  id: number;
  name: string;
  endDate: Date | null; //Permite o null
  status: number;
}