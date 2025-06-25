import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { ListFiltersComponent } from './components/list-filters/list-filters.component';
import { PaginationComponent } from './components/pagination/pagination.component';

// New unified components for detail pages and forms
import { DetailPageHeaderComponent } from './components/detail-page-header/detail-page-header.component';
import { DetailImageComponent } from './components/detail-image/detail-image.component';
import { InfoSectionComponent } from './components/info-section/info-section.component';
import { FormPageHeaderComponent } from './components/form-page-header/form-page-header.component';

@NgModule({
  declarations: [
    PageHeaderComponent,
    ListFiltersComponent,
    PaginationComponent,
    DetailPageHeaderComponent,
    DetailImageComponent,
    InfoSectionComponent,
    FormPageHeaderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PageHeaderComponent,
    ListFiltersComponent,
    PaginationComponent,
    DetailPageHeaderComponent,
    DetailImageComponent,
    InfoSectionComponent,
    FormPageHeaderComponent
  ]
})
export class SharedModule { }
