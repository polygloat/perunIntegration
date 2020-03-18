import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {TranslateService} from 'ngx-polygloat';
import {
  DeleteNotificationDialogComponent
} from '../../../../../shared/components/dialogs/delete-notification-dialog/delete-notification-dialog.component';
import {NotificatorService} from '../../../../../core/services/common/notificator.service';
import {
  EditEmailFooterDialogComponent
} from '../../../../../shared/components/dialogs/edit-email-footer-dialog/edit-email-footer-dialog.component';
import {
  AddEditNotificationDialogComponent
} from '../../../../../shared/components/dialogs/add-edit-notification-dialog/add-edit-notification-dialog.component';
import {
  NotificationsCopyMailsDialogComponent
} from '../../../../../shared/components/dialogs/notifications-copy-mails-dialog/notifications-copy-mails-dialog.component';
import { RegistrarService } from '@perun-web-apps/perun/services';
import { ApplicationForm } from '@perun-web-apps/perun/openapi';
import { ApplicationMail } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-vo-settings-notifications',
  templateUrl: './vo-settings-notifications.component.html',
  styleUrls: ['./vo-settings-notifications.component.scss']
})
export class VoSettingsNotificationsComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private route: ActivatedRoute,
              private registrarService: RegistrarService,
              private translate: TranslateService,
              private dialog: MatDialog,
              private notificator: NotificatorService) { }

  loading = false;
  voId: number;
  applicationForm: ApplicationForm;
  applicationMails: ApplicationMail[] = [];
  selection = new SelectionModel<ApplicationMail>(true, []);

  ngOnInit() {
    this.loading = true;
    this.route.parent.parent.params.subscribe(params => {
      this.voId = params['voId'];
      this.registrarService.getApplicationFormForVo(this.voId).subscribe( form => {
        this.applicationForm = form;
        this.registrarService.getApplicationMailsForVo(this.voId).subscribe( mails => {
          this.applicationMails = mails;
          this.loading = false;
        });
      });
    });
  }

  add() {
    const applicationMail: ApplicationMail = new ApplicationMail();
    applicationMail.formId = this.applicationForm.id;
    const dialog = this.dialog.open(AddEditNotificationDialogComponent, {
      width: '1400px',
      height: '700px',
      data: {voId: this.voId, createMailNotification: true, applicationMail: applicationMail, applicationMails: this.applicationMails}
    });
    dialog.afterClosed().subscribe( success => {
      if (success) {
        this.translate.get('VO_DETAIL.SETTINGS.NOTIFICATIONS.ADD_SUCCESS').subscribe( text => {
          this.notificator.showSuccess(text);
        });
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  remove() {
    const dialog = this.dialog.open(DeleteNotificationDialogComponent, {
      width: '500px',
      data: {voId: this.voId, mails: this.selection.selected}
    });
    dialog.afterClosed().subscribe( success => {
      if (success) {
        this.translate.get('VO_DETAIL.SETTINGS.NOTIFICATIONS.DELETE_SUCCESS').subscribe( text => {
          this.notificator.showSuccess(text);
        });
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  copy() {
    const dialog = this.dialog.open(NotificationsCopyMailsDialogComponent, {
      width: '500px',
      data: {voId: this.voId}
    });
    dialog.afterClosed().subscribe( copyFrom => {
      if (copyFrom) {
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  updateTable() {
    this.loading = true;
    this.registrarService.getApplicationMailsForVo(this.voId).subscribe( mails => {
      this.applicationMails = mails;
      this.loading = false;
    });
  }

  changeEmailFooter() {
    this.dialog.open(EditEmailFooterDialogComponent, {
      width: '500px',
      data: {voId: this.voId}
    });
  }

  changeSelection(selection: SelectionModel<ApplicationMail>) {
    this.selection = selection;
  }
}
