import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CompanyService } from '../../../service/company';
import { PaymentData } from '../../../model/payment-data.model';
import { CompanyData } from '../../../model/company-data.model';
import { PaymentDataDTO } from '../../../model/payment-data-dto.model';

@Component({
  selector: 'app-edit',
  imports: [FormsModule,
            CommonModule,
            ReactiveFormsModule, 
            RouterModule],
  templateUrl: './edit.html',
  styleUrl: './edit.sass'
})
export class PaymentEditComponent implements OnInit {
  isDisabled: boolean = true;
  isEditing: boolean = false;
  tableId: string | null = null;
  companies: CompanyData[] = [];
  tableName: string = "payment";
  
  payment: PaymentDataDTO = {
    id: 0,
    billDTO: {
      id: 0,
      company: {
        id: 0,
        name: "",
        endDate: null, 
        status: 0
      },
      endDate: null, 
      validate: null, 
      value: 0,
      status: 0
    },
    paid: null,
    partialPaid: null,
    paidDate: null,
    status: 0
  };

  editFormTable = new FormGroup({
    id: new FormControl<number>(0),
    companyId: new FormControl<number>(0),
    endDate: new FormControl(''),
    validate: new FormControl(''),
    value: new FormControl<number>(0),
    paid:  new FormControl<number | null>(null),
    partialPaid:  new FormControl<number | null>(null),
    paidDate: new FormControl(''),
    statusId:  new FormControl<number>(0),
  });

  constructor(private route: ActivatedRoute
            , private router: Router
            , private companyService: CompanyService) {

  }

  ngOnInit() {
    this.tableId = this.route.snapshot.paramMap.get('id'); // Pega o ID da rota

    const disableFields = [
                    "companyId",
                    "endDate",
                    "validate",
                    "value",
                    "statusId",
                    ];

    if (this.tableId) {
      this.isEditing = true;
      this.loadPaymentData(Number(this.tableId)); // Carrega os dados
      this.fillSelectCompanyElement();
      this.disableFields(disableFields);
    }
  }

  loadPaymentData(id: number) {
    this.companyService.getPaymentByIdDTO(id).subscribe(item => {
      this.payment.id = item.id,
      this.payment.billDTO.company.id = item.billDTO.company.id,
      this.payment.billDTO.endDate = item.billDTO.endDate,
      this.payment.billDTO.validate = item.billDTO.validate,
      this.payment.billDTO.value = item.billDTO.value,
      this.payment.paid = item.paid,
      this.payment.billDTO.status = item.billDTO.status,
      this.payment.partialPaid = item.partialPaid,
      this.payment.paidDate = item.paidDate,

      this.editFormTable.patchValue({
        id: item.id,
        companyId: item.billDTO.company.id,
        endDate: item.billDTO.endDate ? new Date(item.billDTO.endDate).toISOString().split('T')[0] : null,
        validate: item.billDTO.validate ? new Date(item.billDTO.validate).toISOString().split('T')[0] : null,
        value: item.billDTO.value,
        paid: item.paid,
        partialPaid: item.partialPaid,
        paidDate: item.paidDate ? new Date(item.paidDate).toISOString().split('T')[0] : null,
        statusId: item.billDTO.status
      })
    });
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
  
  disableFields(fields: string[]) {
    for (let i = 0; i < fields.length; i++) {
      const fieldControl = this.editFormTable.get(fields[i]);

      if (fieldControl) {
        fieldControl.disable();
      }
    }
  }

  returnPage() {
    this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }
  
  editForm() {
    console.log("edit")
    const objSend = this.takeFieldsValue();
    console.log(objSend)
    this.companyService.updatePayment(objSend)
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
    // console.log("save")
    // this.router.navigate(['/' + this.tableName]); // Redireciona para o main
  }

  takeFieldsValue() {
    let objResponse: any = {};

    objResponse.id = this.editFormTable.get("id")?.value;
    objResponse.paid = Number(this.editFormTable.get("paid")?.value);
    objResponse.partialPaid = Number(this.editFormTable.get("partialPaid")?.value);
    objResponse.paidDate = this.editFormTable.get("paidDate")?.value + " 00:00:00";

    return objResponse;
  }

  get companyIdControl() {
      return this.editFormTable.get('companyId')?.value;
  }

  get statusIdControl() {
      return this.editFormTable.get('status')?.value;
  }
}
