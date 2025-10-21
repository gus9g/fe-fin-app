import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BillData } from '../../../model/bill-data.model';
import { CompanyService } from '../../../service/company';
import { CompanyData } from '../../../model/company-data.model';
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
export class BillEditComponent implements OnInit {
  isEditing: boolean = false;
  tableId: string | null = null;
  companies: CompanyData[] = [];
  tableName: string = "bill";

  bill: BillData = {
    checkbox: false,
    id: 0,
    company: {
      id: -1,
      name: "",
      endDate: null, 
      status: 0
    },
    endDate: null, 
    validate: null, 
    value: null,
    status: -1
  };

  editFormTable = new FormGroup({
    id: new FormControl<number>(0),
    companyId: new FormControl<number>(-1),
    endDate: new FormControl(''),
    validate: new FormControl(''),
    value: new FormControl<number>(-1),
    status: new FormControl<number>(-1)
  });

  fillSelectCompany: CompanyData = {
    checkbox: false,
    id: 0,
    name: "",
    endDate: null, 
    status: -1
  };
  
  constructor(private route: ActivatedRoute
            , private router: Router
            , private companyService: CompanyService) {

  }

  ngOnInit() {
    this.tableId = this.route.snapshot.paramMap.get('id'); // Pega o ID da rota

    this.fillSelectCompanyElement();
    if (this.tableId) {
      this.isEditing = true;
      this.loadBillData(Number(this.tableId)); // Carrega os dados
    } else {
      this.isEditing = false;
      this.resetForm();
    }
  }

  loadBillData(id: number) {
    this.companyService.getBillById(id).subscribe(item => {
      this.bill.id = item.id,
      this.bill.company = item.company,
      this.bill.endDate = item.endDate,
      this.bill.validate = item.validate,
      this.bill.value = item.value,
      this.bill.status = item.status

      this.editFormTable.patchValue({
        id: item.id,
        companyId: item.company.id,
        endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : null,
        validate: item.validate ? new Date(item.validate).toISOString().split('T')[0] : null,
        value: item.value,
        status: item.status 
      })
    });
  }

  resetForm() {
    this.editFormTable.patchValue({
      id: 0,
      companyId: -1,
      endDate: null, 
      validate: null, 
      value: null,
      status: -1
    })
  }
  
  fillSelectCompanyElement() {
    this.loadCompanies()
  }
  
  loadCompanies() {
    this.companyService.getCompanies().subscribe((companies) => {
      this.companies = companies.map(company => ({
        id: company.id,
        name: company.name,
        endDate: company.endDate ? new Date(company.endDate) : null,
        status: company.status,
        checkbox: false 
      }));

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
    this.companyService.updateBill(objSend)
      .subscribe({
        next: (response) => {
          console.log('Fatura criada com sucesso!', response);
        },
        error: (err) => {
          console.error('Ocorreu um erro ao criar a fatura:', err);
        }
      });
    this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }
  
  saveForm() {
    console.log("save")
    const objSend = this.takeFieldsValue();
    console.log(objSend)
    this.companyService.createBill(objSend)
      .subscribe({
        next: (response) => {
          console.log('Fatura criada com sucesso!', response);
        },
        error: (err) => {
          console.error('Ocorreu um erro ao criar a fatura:', err);
        }
      });
    this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }

  takeFieldsValue() {
    let objResponse: any = {};

    objResponse.id = this.editFormTable.get("id")?.value;
    objResponse.company = {
      id: Number(this.editFormTable.get("companyId")?.value)
    } 
    objResponse.endDate = this.editFormTable.get("endDate")?.value;
    objResponse.validate = this.editFormTable.get("validate")?.value;
    objResponse.value = Number(this.editFormTable.get("value")?.value).toFixed(2).replace(',', '.');
    objResponse.status = Number(this.editFormTable.get("status")?.value);

    return objResponse;
  }

  get companyIdControl() {
      return this.editFormTable.get('companyId')?.value;
  }

  get statusIdControl() {
      return this.editFormTable.get('status')?.value;
  }
}
