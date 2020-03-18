import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource} from '@angular/material';
import {NotificatorService} from '../../../../core/services/common/notificator.service';
import {TranslateService} from 'ngx-polygloat';
import { Facility, Group, RichUser, Vo } from '@perun-web-apps/perun/openapi';
import { AuthzService } from '@perun-web-apps/perun/services';
import { Role } from '@perun-web-apps/perun/models';

export interface RemoveManagerDialogData {
  complementaryObject: Vo | Group | Facility;
  managers: RichUser[];
  role: Role;
  theme: string;
}

@Component({
  selector: 'app-remove-manager-dialog',
  templateUrl: './remove-manager-dialog.component.html',
  styleUrls: ['./remove-manager-dialog.component.scss']
})
export class RemoveManagerDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RemoveManagerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: RemoveManagerDialogData,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private authzService: AuthzService) {
  }

  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<RichUser>;

  loading: boolean;
  theme: string;

  ngOnInit() {
    this.dataSource = new MatTableDataSource<RichUser>(this.data.managers);
    this.theme = this.data.theme;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    this.authzService.unsetRole(this.data.role, this.data.managers.map(manager => manager.id), this.data.complementaryObject)
      .subscribe(() => {
      this.translate.get('DIALOGS.REMOVE_MANAGERS.SUCCESS').subscribe(successMessage => {
        this.notificator.showSuccess(successMessage);
        this.loading = false;
        this.dialogRef.close(true);
      }, () => this.loading = false);
    }, () => this.loading = false);
  }

}
