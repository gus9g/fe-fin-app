import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CompanyService } from '../../../service/company';
import { CompanyData } from '../../../model/company-data.model';

@Component({
  selector: 'app-edit',
  imports: [FormsModule,
            CommonModule,
            ReactiveFormsModule, 
            RouterModule],
  templateUrl: './edit.html',
  styleUrl: './edit.sass'
})
export class CompanyEditComponent implements OnInit {
  isEditing: boolean = false;
  tableId: string | null = null;
  tableName: string = "company";

  company: CompanyData = {
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
    status: new FormControl<number>(-1)
  });

  constructor(private route: ActivatedRoute
            , private router: Router
            , private companyService: CompanyService) {

  }

  ngOnInit() {
    this.tableId = this.route.snapshot.paramMap.get('id'); // Pega o ID da rota

    if (this.tableId) {
      this.isEditing = true;
      this.loadCompanyById(Number(this.tableId)); // Carrega os dados
    } else {
      this.isEditing = false;
      this.resetForm();
    }
  }

  loadCompanyById(id: number) {
    this.companyService.getCompanyById(id).subscribe(item => {
      this.company.id = item.id,
      this.company.name = item.name,
      this.company.endDate = item.endDate,
      this.company.status = item.status

      this.editFormTable.patchValue({
        id: item.id,
        name: item.name,
        endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : null,
        status: item.status 
      })
    });
  }

  resetForm() {
    this.editFormTable.patchValue({
      id: 0,
      name: "",
      endDate: null,
      status: -1
    })
  }
  
  returnPage() {
    this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }
  
  editForm() {
    console.log("edit")
    const objSend = this.takeFieldsValue();
    console.log(objSend)
    this.companyService.updateCompany(objSend)
      .subscribe({
        next: (response) => {
          console.log('Empresa criada com sucesso!', response);
        },
        error: (err) => {
          console.error('Ocorreu um erro ao criar a empresa:', err);
        }
      });
    this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }
  
  saveForm() {
    const objSend = this.takeFieldsValue();
    console.log(objSend)
    this.companyService.createCompany(objSend)
      .subscribe({
        next: (response) => {
          console.log('Empresa criada com sucesso!', response);
        },
        error: (err) => {
          console.error('Ocorreu um erro ao criar a empresa:', err);
        }
      });
    this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }

  takeFieldsValue() {
    let objResponse: any = {};

    objResponse.id = this.editFormTable.get("id")?.value;
    objResponse.name = this.editFormTable.get("name")?.value;
    objResponse.endDate = this.editFormTable.get("endDate")?.value;
    objResponse.status = this.editFormTable.get("status")?.value;

    return objResponse;
  }
  
  get statusIdControl() {
      return this.editFormTable.get('status')?.value;
  }
}
