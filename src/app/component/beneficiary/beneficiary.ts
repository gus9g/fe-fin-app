import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BeneficiaryData } from '../../model/beneficiary-data.model';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BeneficiaryService } from '../../service/beneficiary';
import { map, Subscription } from 'rxjs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-beneficiary',
  imports: [FormsModule,
            CommonModule,
            MatTableModule,
            MatPaginatorModule, 
            MatSortModule, 
            RouterModule],
  templateUrl: './beneficiary.html',
  styleUrl: './beneficiary.sass'
})
export class BeneficiaryComponent implements OnInit, AfterViewInit {
  tableName: string = "beneficiary";
  selectedIds: number[] = [];
  selectId: number[] = [];
  beneficiaries: BeneficiaryData[] = [];
  dataSource = new MatTableDataSource<BeneficiaryData>([])
  private subscription: Subscription = new Subscription();
  fileToUpload: File | null = null;
  message: string = '';
  isSuccess: boolean = false;
  isError: boolean = false;

  displayedColumns: string[] = ['checkbox', 'name', 'endDate', 'status', 'options'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private router: Router
            , private beneficiaryService: BeneficiaryService
            , private cdr: ChangeDetectorRef) {

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
    const beneficiarySubscription = this.loadBeneficiaries();
    this.subscription.add(beneficiarySubscription);

    this.dataSource.filterPredicate = (data: BeneficiaryData, filter: string) => {
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

  loadBeneficiaries() {
    this.beneficiaryService.getBeneficiaries().pipe(
      map(beneficiaries => beneficiaries.map(beneficiary => ({
        id: beneficiary.id,
        name: beneficiary.name,
        endDate: beneficiary.endDate ? new Date(beneficiary.endDate) : null,
        status: beneficiary.status,
        checkbox: false 
      })))
    ).subscribe(processedBeneficiaries => {
      this.beneficiaries = processedBeneficiaries;
      this.dataSource.data = this.beneficiaries;    
      this.cdr.detectChanges();
    });
  }

  addBeneficiary(newBeneficiary: BeneficiaryData) {
    this.beneficiaryService.createBeneficiary(newBeneficiary).subscribe(beneficiary => {
      this.beneficiaries.push(beneficiary);
    });
  }

  editItem(id: number) {
    this.router.navigate(['/'+ this.tableName +'/edit/' + id.toString()]); // Redireciona para o main
  }

  addItem() {
    this.router.navigate(['/'+ this.tableName +'/new']); // Redireciona para o main
  }

  removeSelectedItem() {
    this.beneficiaryService.deleteBeneficiaryIds(this.selectedIds)
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
          // Remove o ID se o checkbox estiver desmarcado
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

  onCheckboxChange(tableElement: BeneficiaryData, isChecked: boolean) {
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
      selectAllCheckbox.checked = allChecked; // Atualiza o checkbox "Selecionar Todos"
    }
  }

  exportar() {
    this.beneficiaryService.exportarDadosBeneficiary().subscribe(blob => {
      // Cria um link temporário para o download
      const downloadLink = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      
      downloadLink.href = url;
      downloadLink.download = 'backup_beneficiary.json'; // Nome do arquivo
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
    
    this.beneficiaryService.importarDadosBeneficiary(this.fileToUpload).subscribe({
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
