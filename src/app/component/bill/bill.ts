import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BillData } from '../../model/bill-data.model';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../service/company';
import { map, Subscription } from 'rxjs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-bill',
  imports: [FormsModule,
            CommonModule,
            MatTableModule, 
            MatPaginatorModule, 
            MatSortModule, 
            RouterModule],
  templateUrl: './bill.html',
  styleUrl: './bill.sass'
})
export class BillComponent implements OnInit, AfterViewInit, AfterViewChecked {
  tableName: string = "bill";
  selectedIds: number[] = [];
  selectId: number[] = [];
  bills: BillData[] = [];
  dataSource = new MatTableDataSource<BillData>([])
  private subscription: Subscription = new Subscription();
  fileToUpload: File | null = null;
  message: string = '';
  isSuccess: boolean = false;
  isError: boolean = false;

  @ViewChild('uploadInput') uploadBtn!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['checkbox', 'company', 'endDate', 'validate', 'value', 'status', 'options'];

  constructor(private router: Router
            , private companyService: CompanyService
            , private cdr: ChangeDetectorRef) {

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
    const billSubscription = this.loadBills();
    this.subscription.add(billSubscription);

    this.dataSource.filterPredicate = (data: BillData, filter: string) => {
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

  // Necessario estar exatamente neste padrão para a tabela ser preenchida na troca de rota
  loadBills() {
    return this.companyService.getBills().pipe(
      map(bills => bills.map(bill => ({
        checkbox: false,
        id: bill.id,
        company: bill.company,
        endDate: bill.endDate ? new Date(bill.endDate.toString().split('T')[0] + 'T00:00:00') : bill.endDate,
        validate: bill.endDate ? new Date(bill.endDate.toString().split('T')[0] + 'T00:00:00') : bill.endDate,
        value: bill.value,
        status: bill.status,
      })))
    ).subscribe(processedBills => {
      this.bills = processedBills; 
      this.dataSource.data = this.bills; 
      this.cdr.detectChanges();
    }, (error) => {
      console.log(`Erro ${this.tableName} ${error}`);
    });
  }

  addBill(newCompany: BillData) {
    this.companyService.createBill(newCompany).subscribe(company => {
      this.bills.push(company);
    });
  }
  
  editItem(id: number) {
    this.router.navigate(['/'+ this.tableName +'/edit/' + id.toString()]); // Redireciona para o main
  }

  addItem() {
    this.router.navigate(['/'+ this.tableName +'/new']); // Redireciona para o main
  }

  removeSelectedItem() {  
    this.companyService.deleteBillIds(this.selectedIds)
    .subscribe({
      next: (resposta) => {
        console.log("Remoção bem-sucedida!", resposta);
      },
      error: (erro) => {
        console.error("Erro ao remover os itens:", erro);
      }
    });
  }

  get selectedCount(): number {
    return this.selectedIds.length;
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    
    this.dataSource.data.forEach(element => {
        element.checkbox = checked; // Atualiza o estado do checkbox

        if (checked) {
            if (!this.selectedIds.includes(element.id)) {
                this.selectedIds.push(element.id);
            }
        } else {
            this.selectedIds = this.selectedIds.filter(id => id !== element.id);
        }
      });
    console.log('Selected IDs:', this.selectedIds);
  }

  updateSelectedIds() {
    this.selectedIds = this.dataSource.data
        .filter(element => element.checkbox)
        .map(element => element.id);
  }

  onCheckboxChange(tableElement: BillData, isChecked: boolean) {
    const elementToUpdate = this.dataSource.data.find(element => element.id === tableElement.id);
    
    if (elementToUpdate) {
        elementToUpdate.checkbox = isChecked;

        if (isChecked) {
            if (!this.selectedIds.includes(elementToUpdate.id)) {
                this.selectedIds.push(elementToUpdate.id);
            }
        } else {
            this.selectedIds = this.selectedIds.filter(id => id !== elementToUpdate.id);
        }
    }

    const allChecked = this.dataSource.data.every(element => element.checkbox);
    const selectAllCheckbox = document.getElementById('selectAll') as HTMLInputElement;
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = allChecked;
    }

    console.log('Selected IDs:', this.selectedIds);
  }

  exportar() {
    this.companyService.exportarDadosBill().subscribe(blob => {
      // Cria um link temporário para o download
      const downloadLink = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      
      downloadLink.href = url;
      downloadLink.download = 'backup_bill.json'; // Nome do arquivo
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
    
    this.companyService.importarDadosBill(this.fileToUpload).subscribe({
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
