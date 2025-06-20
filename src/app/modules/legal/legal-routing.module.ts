import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LegalHomeComponent } from './pages/legal-home/legal-home.component';
import { TermsAndConditionsComponent } from './pages/terms-and-conditions/terms-and-conditions.component';
import { FaqComponent } from './pages/faq/faq.component';
import { TermsUtnComponent } from './pages/terms-utn/terms-utn.component';

const routes: Routes = [
  {
    path: '',
    component: LegalHomeComponent,
    title: 'Centro Legal - RecitApp'
  },
  {
    path: 'terms',
    component: TermsAndConditionsComponent,
    title: 'Términos y Condiciones - RecitApp'
  },
  {
    path: 'terms/utn',
    component: TermsUtnComponent,
    title: 'Términos y Condiciones UTN - RecitApp'
  },
  {
    path: 'faq',
    component: FaqComponent,
    title: 'Preguntas Frecuentes - RecitApp'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LegalRoutingModule { } 