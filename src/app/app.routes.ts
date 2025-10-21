import { Routes } from '@angular/router';
import { CompanyComponent } from './component/company/company';
import { BillComponent } from './component/bill/bill';
import { PaymentComponent } from './component/payment/payment';
import { BeneficiaryComponent } from './component/beneficiary/beneficiary';
import { ActiveComponent } from './component/active/active';
import { DashboardComponent } from './component/dashboard/dashboard';
import { CompanyEditComponent } from './component/company/edit/edit';
import { BillEditComponent } from './component/bill/edit/edit';
import { PaymentEditComponent } from './component/payment/edit/edit';
import { BeneficiaryEditComponent } from './component/beneficiary/edit/edit';
import { ActiveEditComponent } from './component/active/edit/edit';

export const routes: Routes = [
    // { path: '', redirectTo: '/login', pathMatch: 'full'}, // Redireciona para o login
    { path: '', redirectTo: '/company', pathMatch: 'full'}, // Redireciona para o login
    // { path: 'login', component: LoginComponent, pathMatch: 'full' },
    // { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent, pathMatch: 'full' },
    { path: 'company', component: CompanyComponent, pathMatch: 'full' },
    { path: 'company/new', component: CompanyEditComponent, pathMatch: 'full' },
    { path: 'company/edit/:id', component: CompanyEditComponent, pathMatch: 'full' },
    { path: 'bill', component: BillComponent, pathMatch: 'full' },
    { path: 'bill/new', component: BillEditComponent, pathMatch: 'full' },
    { path: 'bill/edit/:id', component: BillEditComponent, pathMatch: 'full' },
    { path: 'payment', component: PaymentComponent, pathMatch: 'full' },
    { path: 'payment/edit/:id', component: PaymentEditComponent, pathMatch: 'full' },
    { path: 'beneficiary', component: BeneficiaryComponent, pathMatch: 'full' },
    { path: 'beneficiary/new', component: BeneficiaryEditComponent, pathMatch: 'full' },
    { path: 'beneficiary/edit/:id', component: BeneficiaryEditComponent, pathMatch: 'full' },
    { path: 'active', component: ActiveComponent, pathMatch: 'full' },
    { path: 'active/new', component: ActiveEditComponent, pathMatch: 'full' },
    { path: 'active/edit/:id', component: ActiveEditComponent, pathMatch: 'full' },

    // Adicione outras rotas aqui
    { path: '**', redirectTo: '' } // Redireciona para o Dashboard para rotas não encontradas
];
