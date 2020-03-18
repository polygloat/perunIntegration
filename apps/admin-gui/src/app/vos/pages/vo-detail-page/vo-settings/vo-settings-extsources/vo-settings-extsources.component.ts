import { Component, OnInit } from '@angular/core';
import { ExtSourceService } from '@perun-web-apps/perun/services';
import { ActivatedRoute } from '@angular/router';
import { ExtSource } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material';
import { AddExtSourceDialogComponent } from '../../../../../shared/components/dialogs/add-ext-source-dialog/add-ext-source-dialog.component';
import { NotificatorService } from '../../../../../core/services/common/notificator.service';
import { TranslateService } from 'ngx-polygloat';

@Component({
  selector: 'app-vo-settings-extsources',
  templateUrl: './vo-settings-extsources.component.html',
  styleUrls: ['./vo-settings-extsources.component.scss']
})
export class VoSettingsExtsourcesComponent implements OnInit {

  constructor(private extSourceService: ExtSourceService,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private notificator: NotificatorService,
              private translate: TranslateService) {
    this.translate.get('VO_DETAIL.SETTINGS.EXT_SOURCES.SUCCESS_REMOVED').subscribe(result => this.successMessage = result);
  }

  voId: number;
  extSources: ExtSource[] = [];
  selection = new SelectionModel<ExtSource>(true, []);
  loading: boolean;
  filterValue = '';
  successMessage: string;

  ngOnInit() {
    this.route.parent.parent.params.subscribe(parentParams => {
      this.voId = parentParams['voId'];
      this.refreshTable();
    });
  }

  refreshTable() {
    this.loading = true;
    this.extSourceService.getVoExtSources(this.voId).subscribe(sources => {
      this.extSources = sources;
      this.selection.clear();
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  onAdd() {
    const dialogRef = this.dialog.open(AddExtSourceDialogComponent, {
      width: '1000px',
      data: {
        voId: this.voId,
        voExtSources: this.extSources,
        theme: 'vo-theme'
      }
    });
    dialogRef.afterClosed().subscribe(added => {
      if (added) {
        this.refreshTable();
      }
    });
  }

  onRemove() {
    for (const extSource of this.selection.selected) {
      this.extSourceService.removeExtSources(this.voId, extSource.id).subscribe(_ => {
        this.notificator.showSuccess(this.successMessage + extSource.name);
        this.refreshTable();
      });
    }
  }
}
