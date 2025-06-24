import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { ListFiltersComponent } from './components/list-filters/list-filters.component';
import { PaginationComponent } from './components/pagination/pagination.component';

@NgModule({
  declarations: [
    PageHeaderComponent,
    ListFiltersComponent,
    PaginationComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PageHeaderComponent,
    ListFiltersComponent,
    PaginationComponent
  ]
})
export class SharedModule { }
