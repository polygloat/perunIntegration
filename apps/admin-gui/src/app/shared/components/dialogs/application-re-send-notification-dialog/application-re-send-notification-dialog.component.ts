import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {TranslateService} from 'ngx-polygloat';
import {NotificatorService} from '../../../../core/services/common/notificator.service';
import { RegistrarService } from '@perun-web-apps/perun/services';

export interface DialogData {
  applicationId: number;
}

@Component({
  selector: 'app-application-re-send-notification-dialog',
  templateUrl: './application-re-send-notification-dialog.component.html',
  styleUrls: ['./application-re-send-notification-dialog.component.scss']
})
export class ApplicationReSendNotificationDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ApplicationReSendNotificationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              private translate: TranslateService,
              private notificator: NotificatorService,
              private registrarService: RegistrarService) { }

  mailType = 'APP_CREATED_USER';
  reason = '';

  ngOnInit() {
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.mailType === 'APP_REJECTED_USER') {
      this.registrarService.sendMessageWithReason(this.data.applicationId, this.mailType, this.reason).subscribe( any => {
        this.translate.get('DIALOGS.RE_SEND_NOTIFICATION.SUCCESS').subscribe(successMessage => {
          this.notificator.showSuccess(successMessage);
          this.dialogRef.close();
        });
      });
    } else {
      this.registrarService.sendMessage(this.data.applicationId, this.mailType).subscribe( any => {
        this.translate.get('DIALOGS.RE_SEND_NOTIFICATION.SUCCESS').subscribe(successMessage => {
          this.notificator.showSuccess(successMessage);
          this.dialogRef.close();
        });
      });
    }
  }
}
