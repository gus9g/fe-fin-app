import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CompanyData } from '../../model/company-data.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../service/company';
import { map, Subscription } from 'rxjs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-company',
  imports: [FormsModule,
            CommonModule,
            MatTableModule,
            MatPaginatorModule, 
            MatSortModule, 
            RouterModule ],
  templateUrl: './company.html',
  styleUrls: ['./company.sass']
})
export class CompanyComponent implements OnInit, AfterViewInit, AfterViewChecked {
  tableName: string = "company"
  selectedIds: number[] = [];
  selectId: number[] = [];
  companies: CompanyData[] = [];
  dataSource = new MatTableDataSource<CompanyData>([])
  private subscription: Subscription = new Subscription();
  fileToUpload: File | null = null;
  message: string = '';
  isSuccess: boolean = false;
  isError: boolean = false;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['checkbox', 'name', 'endDate', 'status', 'options'];

  constructor(private router: Router
            , private companyService: CompanyService
            , private cdr: ChangeDetectorRef) {

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
    const companySubscription = this.loadCompanies();
    this.subscription.add(companySubscription);

    this.dataSource.filterPredicate = (data: CompanyData, filter: string) => {
        return data.name.toLowerCase().includes(filter) || false;
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
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Necessario estar exatamente neste padrão para a tabela ser preenchida na troca de rota
  loadCompanies() {
    this.companyService.getCompanies().pipe(
      map(companies => companies.map(company => ({
        id: company.id,
        name: company.name,
        endDate: company.endDate ? new Date(company.endDate.toString().split('T')[0] + 'T00:00:00') : company.endDate,
        status: company.status,
        checkbox: false // Adiciona o campo checkbox com valor false
      })))
    ).subscribe(processedCompanies => {
      this.companies = processedCompanies
      this.dataSource.data = this.companies;
      this.cdr.detectChanges();
    }, (error) => {
      console.log(`Erro ${this.tableName} ${error}`)
    });
  }

  addCompany(newCompany: CompanyData) {
    this.companyService.createCompany(newCompany).subscribe(company => {
      this.companies.push(company);
    });
  }

  editItem(id: number) {
    this.router.navigate(['/'+ this.tableName +'/edit/' + id.toString()]); // Redireciona para o main
  }

  addItem() {
    this.router.navigate(['/'+ this.tableName +'/new']); // Redireciona para o main
  }

  removeSelectedItem() {
    this.companyService.deleteCompanyIds(this.selectedIds)
    .subscribe({
      next: (resposta) => {
        // Este bloco só é executado se a requisição for bem-sucedida.
        console.log("Remoção bem-sucedida!", resposta);
        // Coloque aqui a lógica para atualizar a sua lista, exibir uma mensagem de sucesso, etc.
      },
      error: (erro) => {
        // Este bloco só é executado se houver um erro na requisição.
        console.error("Erro ao remover os itens:", erro);
        // Coloque aqui a lógica para exibir uma mensagem de erro para o usuário.
      }
    });
  }

  get selectedCount(): number {
    return this.selectedIds.length;
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    
    this.dataSource.data.forEach(element => {
        element.checkbox = checked;

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

  onCheckboxChange(tableElement: CompanyData, isChecked: boolean) {
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
  }

  exportar() {
    this.companyService.exportarDadosCompany().subscribe(blob => {
      // Cria um link temporário para o download
      const downloadLink = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      
      downloadLink.href = url;
      downloadLink.download = 'backup_company.json'; // Nome do arquivo
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
    
    this.companyService.importarDadosCompany(this.fileToUpload).subscribe({
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
