import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PaymentData } from '../../model/payment-data.model';
import { Router, RouterModule } from '@angular/router';
import { CompanyService } from '../../service/company';
import { map, Subscription } from 'rxjs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-payment',
  imports: [CommonModule,
            MatTableModule, 
            MatPaginatorModule, 
            MatSortModule, 
            RouterModule],
  templateUrl: './payment.html',
  styleUrl: './payment.sass'
})
export class PaymentComponent implements OnInit, AfterViewInit, AfterViewChecked {
  tableName: string = "payment";
  payments: PaymentData[] = [];
  dataSource = new MatTableDataSource<PaymentData>([])
  private subscription: Subscription = new Subscription();
  fileToUpload: File | null = null;
  message: string = '';
  isSuccess: boolean = false;
  isError: boolean = false;

  displayedColumns: string[] = [ 'company', 'endDate', 'validate', 'value', 'paid', 'partialPaid', 'paidDate', 'status', 'options'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private router: Router
            , private companyService: CompanyService
            , private cdr: ChangeDetectorRef) {

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  
  ngOnInit(): void {
    const companySubscription = this.loadPayments();
    this.subscription.add(companySubscription);

    this.dataSource.filterPredicate = (data: PaymentData, filter: string) => {
        return data.company.name.toLowerCase().includes(filter) || false;
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewChecked(): void {
    if (this.dataSource && this.sort && this.dataSource.sort !== this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.dataSource && this.paginator && this.dataSource.paginator !== this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    this.dataSource.sortingDataAccessor = (item, property) => {
        if (property === 'company') {
          return item.company?.name || ''; // Retorna o nome da empresa
        }
        return item.company?.name || ''; // Retorna o nome da empresa
    };
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadPayments() {
    this.companyService.getPayments().pipe(
      map(payments => payments.map(payment => ({
        id: payment.id,
        company: payment.company,
        endDate: payment.endDate,
        validate: payment.validate,
        value: payment.value,
        paid: payment.paid,
        partialPaid: payment.partialPaid,
        paidDate: payment.paidDate,
        status: payment.status,
      })))
    ).subscribe(processedPayments => {
      this.payments = processedPayments
      this.dataSource.data = this.payments;
      this.cdr.detectChanges();
    }, (error) => {
      console.log(`Erro ${this.tableName} ${error}`)
    });
  }

  addBill(newPayment: PaymentData) {
    this.companyService.createPayment(newPayment).subscribe(payment => {
      this.payments.push(payment);
    });
  }
    
  editItem(id: number) {
    this.router.navigate(['/'+ this.tableName +'/edit/' + id.toString()]); // Redireciona para o main
  }

  addItem() {
    this.router.navigate(['/'+ this.tableName +'/new']); // Redireciona para o main
  }

  exportar() {
    this.companyService.exportarDadosPayment().subscribe(blob => {
      // Cria um link temporário para o download
      const downloadLink = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      
      downloadLink.href = url;
      downloadLink.download = 'backup_payment.json'; // Nome do arquivo
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }

  onFileSelected(event: any) {
    this.message = '';
    this.isSuccess = false;
    this.isError = false;
    
    this.fileToUpload = event.target.files.item(0);
  }

  import() {
    if (!this.fileToUpload) {
      this.message = 'Selecione um arquivo JSON primeiro.';
      return;
    }
    
    this.message = 'Importando... Aguarde.';
    
    this.companyService.importarDadosPayment(this.fileToUpload).subscribe({
      next: (response) => {
        this.message = 'Importação concluída com sucesso!';
        this.isSuccess = true;
        this.isError = false;
        this.fileToUpload = null; 
        (document.getElementById('fileInput') as HTMLInputElement).value = '';
      },
      error: (err) => {
        const errorMessage = err.error || 'Falha na importação devido a um erro no servidor.';
        this.message = `Erro: ${errorMessage}`;
        this.isSuccess = false;
        this.isError = true;
      }
    });
  }
}
