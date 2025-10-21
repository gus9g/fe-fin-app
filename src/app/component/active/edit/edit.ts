import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BeneficiaryService } from '../../../service/beneficiary';
import { BeneficiaryData } from '../../../model/beneficiary-data.model';
import { ActiveData } from '../../../model/active-data.model';
import { map } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-edit',
  imports: [FormsModule,
            CommonModule,
            ReactiveFormsModule,
            NgxMaskDirective, 
            RouterModule],
  templateUrl: './edit.html',
  styleUrl: './edit.sass'
})
export class ActiveEditComponent implements OnInit {
  isEditing: boolean = false;
  tableId: string | null = null;
  beneficiaries: BeneficiaryData[] = [];
  tableName: string = "active";

  active: ActiveData = {
    id: 0,
    beneficiaryDTO: {
      id: -1,
      name: "",
      endDate: null, 
      status: 0
    },
    value: null,
    endDate: null, 
    statusActive: -1,
  }

  editFormTable = new FormGroup({
    id: new FormControl<number>(0),
    beneficiaryId: new FormControl<number>(-1),
    endDate: new FormControl(''),
    value: new FormControl<number | null>(null),
    statusId: new FormControl<number>(-1)
  });
  
  fillSelectBeneficiary: BeneficiaryData = {
    id: 0,
    name: "",
    endDate: null, 
    status: 0
  };

  constructor(private route: ActivatedRoute
            , private router: Router
            , private beneficiaryService: BeneficiaryService
            , private cdr: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.tableId = this.route.snapshot.paramMap.get('id'); // Pega o ID da rota

    this.fillSelectBeneficiariesElement();
    if (this.tableId) {
      this.isEditing = true;
      this.loadActiveData(Number(this.tableId)); // Carrega os dados
    }
    console.log("TEste")
  }

  ngAfterViewInit() {

  }

  loadActiveData(id: number) {
    this.beneficiaryService.getActiveById(id).subscribe(item => {
      this.active.id = item.id,
      this.active.beneficiaryDTO = item.beneficiaryDTO,
      this.active.endDate = item.endDate,
      this.active.value = item.value,
      this.active.statusActive = item.statusActive

      this.editFormTable.patchValue({
        id: item.id,
        beneficiaryId: item.beneficiaryDTO.id || null,
        endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : null,
        value: item.value,
        statusId: Number(item.statusActive) 
      })
    });
  }

  resetForm() {
    this.editFormTable.patchValue({
      id: 0,
      beneficiaryId: -1,
      endDate: null, 
      value: null,
      statusId: -1
    })
  }
  
  fillSelectBeneficiariesElement() {
    this.loadBeneficiaries()
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
    )
    .subscribe((processedBeneficiaries) => {
      this.beneficiaries = processedBeneficiaries;
      this.cdr.detectChanges();
    }, (error) => {
      console.log(`Erro ${this.tableName} ${error}`);
    });
  }
  
  returnPage() {
    this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }
  
  editForm() {
    console.log("edit")
    const objSend = this.takeFieldsValue();
    console.log(objSend)
    this.beneficiaryService.updateActive(objSend)
      .subscribe({
        next: (response) => {
          console.log('Ativos criada com sucesso!', response);
        },
        error: (err) => {
          console.error('Ocorreu um erro ao criar a ativos:', err);
        }
      });
    this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }
  
  saveForm() {
    const objSend = this.takeFieldsValue();
    console.log(objSend)
    this.beneficiaryService.createActive(objSend)
      .subscribe({
        next: (response) => {
          console.log('Ativos criada com sucesso!', response);
        },
        error: (err) => {
          console.error('Ocorreu um erro ao criar a ativos:', err);
        }
      });
    this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }

  takeFieldsValue() {
    let objResponse: any = {};

    objResponse.id = this.editFormTable.get("id")?.value;
    objResponse.beneficiaryDTO = {
      id: Number(this.editFormTable.get("beneficiaryId")?.value)
    } ;
    objResponse.value = Number(this.editFormTable.get("value")?.value);
    objResponse.endDate = this.editFormTable.get("endDate")?.value;
    objResponse.statusActive = Number(this.editFormTable.get("statusId")?.value);

    return objResponse;
  }
  
  get beneficiaryIdControl() {
      return this.editFormTable.get('beneficiaryId')?.value;
  }
  
  get statusIdControl() {
      return this.editFormTable.get('statusId')?.value;
  }
}
