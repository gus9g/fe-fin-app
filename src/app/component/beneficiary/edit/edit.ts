import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BeneficiaryData } from '../../../model/beneficiary-data.model';
import { BeneficiaryService } from '../../../service/beneficiary';

@Component({
  selector: 'app-edit',
  imports: [FormsModule,
            CommonModule,
            ReactiveFormsModule, 
            RouterModule],
  templateUrl: './edit.html',
  styleUrl: './edit.sass'
})
export class BeneficiaryEditComponent implements OnInit {
  isEditing: boolean = false;
  tableId: string | null = null;
  tableName: string = "beneficiary";

  beneficiary: BeneficiaryData = {
      checkbox: false,
      id: 0,
      name: "",
      endDate: null, 
      status: -1
  };

  editFormTable = new FormGroup({
    id: new FormControl<number>(0),
    name: new FormControl(''),
    endDate: new FormControl(''),
    statusId: new FormControl<number>(-1)
  });

  constructor(private route: ActivatedRoute
            , private router: Router
            , private beneficiaryService: BeneficiaryService) {

  }

  ngOnInit() {
    this.tableId = this.route.snapshot.paramMap.get('id'); // Pega o ID da rota

    if (this.tableId) {
      this.isEditing = true;
      this.loadBeneficiaryById(Number(this.tableId)); // Carrega os dados
    } else {
      this.isEditing = false;
      this.resetForm();
    }
  }

  loadBeneficiaryById(id: number) {
    this.beneficiaryService.getBeneficiaryById(id).subscribe(item => {
      this.beneficiary.id = item.id,
      this.beneficiary.name = item.name,
      this.beneficiary.endDate = item.endDate,
      this.beneficiary.status = item.status

      this.editFormTable.patchValue({
        id: item.id,
        name: item.name,
        endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : null,
        statusId: item.status 
      })
    });
  }

  resetForm() {
    this.editFormTable.patchValue({
      id: 0,
      name: "",
      endDate: null,
      statusId: -1
    })
  }
  
  returnPage() {
    this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }
  
  editForm() {
    console.log("edit")
    const objSend = this.takeFieldsValue();
    console.log(objSend)
    this.beneficiaryService.updateBeneficiary(objSend)
      .subscribe({
        next: (response) => {
          console.log('Beneficiários criada com sucesso!', response);
        },
        error: (err) => {
          console.error('Ocorreu um erro ao criar a beneficiários:', err);
        }
      });
    this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }
  
  saveForm() {
    const objSend = this.takeFieldsValue();
    console.log(objSend)
    this.beneficiaryService.createBeneficiary(objSend)
      .subscribe({
        next: (response) => {
          console.log('Beneficiários criada com sucesso!', response);
        },
        error: (err) => {
          console.error('Ocorreu um erro ao criar a beneficiários:', err);
        }
      });
    this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }

  takeFieldsValue() {
    let objResponse: any = {};

    objResponse.id = this.editFormTable.get("id")?.value;
    objResponse.name = this.editFormTable.get("name")?.value;
    objResponse.endDate = this.editFormTable.get("endDate")?.value;
    objResponse.status = (this.editFormTable.get("statusId")?.value);

    return objResponse;
  }

  
  get statusIdControl() {
      return this.editFormTable.get('statusId')?.value;
  }
}
