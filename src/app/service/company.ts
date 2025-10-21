import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { CompanyData } from '../model/company-data.model';
import { BillData } from '../model/bill-data.model';
import { PaymentData } from '../model/payment-data.model';
import { PaymentDataDTO } from '../model/payment-data-dto.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = 'http://localhost:8081/api-fin-company';

  private companyTable = "company"
  private billTable = "bill"
  private paymentTable = "payment"
  private companies$: Observable<CompanyData[]> | undefined; // Necessario para solucionar o Bug de reconstrução do componente não preencher a mat-table, na troca de rota
  private bills$: Observable<BillData[]> | undefined; // Necessario para solucionar o Bug de reconstrução do componente não preencher a mat-table, na troca de rota
  private payments$: Observable<PaymentData[]> | undefined; // Necessario para solucionar o Bug de reconstrução do componente não preencher a mat-table, na troca de rota

  constructor(private http: HttpClient) {}

  // Company
  getCompanies(): Observable<CompanyData[]> {
    if (!this.companies$) {
      this.companies$ = this.http.get<CompanyData[]>(`${this.apiUrl}/${this.companyTable}/list`).pipe(
        // Este operador armazena o último valor retornado
        // e o envia a qualquer novo subscriber imediatamente
        shareReplay(1) // Necessario para solucionar o Bug de reconstrução do componente não preencher a mat-table, na troca de rota
      );
    }
    return this.companies$;
  }

  createCompany(item: CompanyData): Observable<CompanyData> {
    return this.http.post<CompanyData>(`${this.apiUrl}/${this.companyTable}/create`, item);
  }

  updateCompany(item: CompanyData): Observable<CompanyData> {
    return this.http.put<CompanyData>(`${this.apiUrl}/${this.companyTable}/${item.id}`, item);
  }

  getCompanyById(id: number): Observable<CompanyData> {
    return this.http.get<CompanyData>(`${this.apiUrl}/${this.companyTable}/${id}`);
  }

  deleteCompanyIds(ids: number[]): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      body: ids
    };

    return this.http.delete<CompanyData>(`${this.apiUrl}/${this.companyTable}/companies`, options);
  }

  // Método para Exportação (Download)
  exportarDadosCompany(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${this.companyTable}/exportar`, { responseType: 'blob' });
  }

  // Método para Importação (Upload)
  importarDadosCompany(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${this.companyTable}/importar`, formData);
  }

  // Bill
  getBills(): Observable<BillData[]> {
    if (!this.bills$) {
      this.bills$ = this.http.get<BillData[]>(`${this.apiUrl}/${this.billTable}/list`).pipe(
        // Este operador armazena o último valor retornado
        // e o envia a qualquer novo subscriber imediatamente
        shareReplay(1) // Necessario para solucionar o Bug de reconstrução do componente não preencher a mat-table, na troca de rota
      );
    }
    return this.bills$;
  }

  createBill(item: BillData): Observable<BillData> {
    return this.http.post<BillData>(`${this.apiUrl}/${this.billTable}/create`, item);
  }

  updateBill(item: BillData): Observable<BillData> {
    return this.http.put<BillData>(`${this.apiUrl}/${this.billTable}/${item.id}`, item);
  }

  getBillById(id: number): Observable<BillData> {
    return this.http.get<BillData>(`${this.apiUrl}/${this.billTable}/${id}`);
  }

  deleteBillIds(ids: number[]): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      body: ids
    };

    return this.http.delete<BillData>(`${this.apiUrl}/${this.billTable}/bills`, options);
  }

  // Método para Exportação (Download)
  exportarDadosBill(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${this.billTable}/exportar`, { responseType: 'blob' });
  }

  // Método para Importação (Upload)
  importarDadosBill(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${this.billTable}/importar`, formData);
  } 


  // Payments
  getPayments(): Observable<PaymentData[]> {
    if (!this.payments$) {
      this.payments$ = this.http.get<PaymentData[]>(`${this.apiUrl}/${this.paymentTable}/list`).pipe(
        // Este operador armazena o último valor retornado
        // e o envia a qualquer novo subscriber imediatamente
        shareReplay(1) // Necessario para solucionar o Bug de reconstrução do componente não preencher a mat-table, na troca de rota
      );
    }
    return this.payments$;
  }

  createPayment(item: PaymentData): Observable<PaymentData> {
    return this.http.post<PaymentData>(`${this.apiUrl}/${this.paymentTable}/create`, item);
  } 

  updatePayment(item: PaymentData): Observable<PaymentData> {
    return this.http.put<PaymentData>(`${this.apiUrl}/${this.paymentTable}/${item.id}`, item);
  }

  getPaymentById(id: number): Observable<PaymentData> {
    return this.http.get<PaymentData>(`${this.apiUrl}/${this.paymentTable}/${id}`);
  }

  getPaymentByIdDTO(id: number): Observable<PaymentDataDTO> {
    return this.http.get<PaymentDataDTO>(`${this.apiUrl}/${this.paymentTable}/${id}`);
  }

  // Método para Exportação (Download)
  exportarDadosPayment(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${this.paymentTable}/exportar`, { responseType: 'blob' });
  }

  // Método para Importação (Upload)
  importarDadosPayment(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${this.paymentTable}/importar`, formData);
  } 

}
