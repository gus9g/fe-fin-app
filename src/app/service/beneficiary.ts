import { Injectable } from '@angular/core';
import { ActiveData } from '../model/active-data.model';
import { Observable, shareReplay } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BeneficiaryData } from '../model/beneficiary-data.model';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {
  private apiUrl = 'http://localhost:8082/api-fin-beneficiaries';

  private beneficiaryTable = "beneficiaries"
  private activeTable = "actives"
  private beneficiaries$: Observable<BeneficiaryData[]> | undefined; // Necessario para solucionar o Bug de reconstrução do componente não preencher a mat-table, na troca de rota
  private actives$: Observable<ActiveData[]> | undefined; // Necessario para solucionar o Bug de reconstrução do componente não preencher a mat-table, na troca de rota

  constructor(private http: HttpClient) {}

  // Beneficiaries 
  getBeneficiaries(): Observable<BeneficiaryData[]> {
    if (!this.beneficiaries$) {
      this.beneficiaries$ = this.http.get<BeneficiaryData[]>(`${this.apiUrl}/${this.beneficiaryTable}/list`).pipe(
        // Este operador armazena o último valor retornado
        // e o envia a qualquer novo subscriber imediatamente
        shareReplay(1) // Necessario para solucionar o Bug de reconstrução do componente não preencher a mat-table, na troca de rota
      );
    }
    return this.beneficiaries$;
  }

  createBeneficiary(item: BeneficiaryData): Observable<BeneficiaryData> {
    return this.http.post<BeneficiaryData>(`${this.apiUrl}/${this.beneficiaryTable}/create`, item);
  }

  updateBeneficiary(item: BeneficiaryData): Observable<BeneficiaryData> {
    return this.http.put<BeneficiaryData>(`${this.apiUrl}/${this.beneficiaryTable}/${item.id}`, item);
  }
  
  getBeneficiaryById(id: number): Observable<BeneficiaryData> {
    return this.http.get<BeneficiaryData>(`${this.apiUrl}/${this.beneficiaryTable}/${id}`);
  }

  deleteBeneficiaryIds(ids: number[]): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      body: ids
    };

    return this.http.delete<BeneficiaryData>(`${this.apiUrl}/${this.beneficiaryTable}/beneficiary`, options);
  }

  // Método para Exportação (Download)
  exportarDadosBeneficiary(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${this.beneficiaryTable}/exportar`, { responseType: 'blob' });
  }

  // Método para Importação (Upload)
  importarDadosBeneficiary(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${this.beneficiaryTable}/importar`, formData);
  }

  // Active 
  getActives(): Observable<ActiveData[]> {
    if (!this.actives$) {
      this.actives$ = this.http.get<ActiveData[]>(`${this.apiUrl}/${this.activeTable}/list`).pipe(
        // Este operador armazena o último valor retornado
        // e o envia a qualquer novo subscriber imediatamente
        shareReplay(1) // Necessario para solucionar o Bug de reconstrução do componente não preencher a mat-table, na troca de rota
      );
    }
    return this.actives$;
  }

  createActive(item: ActiveData): Observable<ActiveData> {
    return this.http.post<ActiveData>(`${this.apiUrl}/${this.activeTable}/create`, item);
  }

  updateActive(item: ActiveData): Observable<ActiveData> {
    return this.http.put<ActiveData>(`${this.apiUrl}/${this.activeTable}/${item.id}`, item);
  }
  
  getActiveById(id: number): Observable<ActiveData> {
    return this.http.get<ActiveData>(`${this.apiUrl}/${this.activeTable}/${id}`);
  }

  deleteActiveIds(ids: number[]): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      body: ids
    };

    return this.http.delete<ActiveData>(`${this.apiUrl}/${this.activeTable}/active`, options);
  }

  // Método para Exportação (Download)
  exportarDadosActive(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${this.activeTable}/exportar`, { responseType: 'blob' });
  }

  // Método para Importação (Upload)
  importarDadosActive(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${this.activeTable}/importar`, formData);
  }

}
