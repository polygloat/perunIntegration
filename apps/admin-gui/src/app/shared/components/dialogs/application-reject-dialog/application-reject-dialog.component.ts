import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {TranslateService} from 'ngx-polygloat';
import {NotificatorService} from '../../../../core/services/common/notificator.service';
import { RegistrarService } from '@perun-web-apps/perun/services';

export interface DialogData {
  applicationId: number;
}

@Component({
  selector: 'app-application-reject-dialog',
  templateUrl: './application-reject-dialog.component.html',
  styleUrls: ['./application-reject-dialog.component.scss']
})
export class ApplicationRejectDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ApplicationRejectDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              private translate: TranslateService,
              private notificator: NotificatorService,
              private registrarService: RegistrarService) { }

  reason = '';

  ngOnInit() {
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.registrarService.rejectApplication(this.data.applicationId, this.reason).subscribe( any => {
      this.translate.get('DIALOGS.REJECT_APPLICATION.SUCCESS').subscribe(successMessage => {
        this.notificator.showSuccess(successMessage);
        this.dialogRef.close();
      });
    });
  }

}
