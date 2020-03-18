import { Component, OnInit } from '@angular/core';
import { ExtSourceService } from '@perun-web-apps/perun/services';
import { NotificatorService } from '../../../../core/services/common/notificator.service';
import { TranslateService } from 'ngx-polygloat';
import { ExtSource } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-admin-ext-sources',
  templateUrl: './admin-ext-sources.component.html',
  styleUrls: ['./admin-ext-sources.component.scss']
})
export class AdminExtSourcesComponent implements OnInit {

  constructor(private extSourceService: ExtSourceService,
              private notificator: NotificatorService,
              private translate: TranslateService
  ) {
    this.translate.get('ADMIN.EXT_SOURCES.LOAD_SUCCESS').subscribe(result => this.loadSuccess = result);
  }

  extSources: ExtSource[] = [];

  filterValue = '';

  loading = false;

  loadSuccess: string;

  ngOnInit() {
    this.refreshTable();
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  onLoad() {
    this.extSourceService.loadExtSources().subscribe(() => {
      this.notificator.showSuccess(this.loadSuccess);
      this.refreshTable();
    });
  }

  refreshTable() {
    this.loading = true;
    this.extSourceService.getExtSources().subscribe(result => {
      this.extSources = result;
      this.loading = false;
    });
  }
}
