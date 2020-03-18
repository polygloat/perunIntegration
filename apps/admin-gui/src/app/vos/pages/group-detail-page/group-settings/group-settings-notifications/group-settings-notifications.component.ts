import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from 'ngx-polygloat';
import {MatDialog} from '@angular/material';
import {NotificatorService} from '../../../../../core/services/common/notificator.service';
import {SelectionModel} from '@angular/cdk/collections';
import {
  AddEditNotificationDialogComponent
} from '../../../../../shared/components/dialogs/add-edit-notification-dialog/add-edit-notification-dialog.component';
import {
  DeleteNotificationDialogComponent
} from '../../../../../shared/components/dialogs/delete-notification-dialog/delete-notification-dialog.component';
import {
  NotificationsCopyMailsDialogComponent
} from '../../../../../shared/components/dialogs/notifications-copy-mails-dialog/notifications-copy-mails-dialog.component';
import {
  EditEmailFooterDialogComponent
} from '../../../../../shared/components/dialogs/edit-email-footer-dialog/edit-email-footer-dialog.component';
import { RegistrarService } from '@perun-web-apps/perun/services';
import { ApplicationForm } from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService } from '../../../../../core/services/api/api-request-configuration.service';
import { ApplicationMail } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-group-settings-notifications',
  templateUrl: './group-settings-notifications.component.html',
  styleUrls: ['./group-settings-notifications.component.scss']
})
export class GroupSettingsNotificationsComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private route: ActivatedRoute,
              private registrarService: RegistrarService,
              private translate: TranslateService,
              private dialog: MatDialog,
              private apiRequest: ApiRequestConfigurationService,
              private notificator: NotificatorService) { }

  loading = false;
  voId: number;
  groupId: number;
  applicationForm: ApplicationForm;
  applicationMails: ApplicationMail[] = [];
  selection = new SelectionModel<ApplicationMail>(true, []);
  noApplicationForm = false;


  ngOnInit() {
    this.loading = true;
    this.route.parent.parent.params.subscribe(params => {
      this.voId = params['voId'];
      this.groupId = params['groupId'];

      // FIXME this might not work in case of some race condition (other request finishes sooner)
      this.apiRequest.dontHandleErrorForNext();
      this.registrarService.getApplicationFormForGroup(this.groupId, false).subscribe( form => {
        this.applicationForm = form;
        this.registrarService.getApplicationMailsForGroup(this.groupId).subscribe( mails => {
          this.applicationMails = mails;
          this.loading = false;
        });
      }, error => {
        if (error.name === 'FormNotExistsException') {
          this.noApplicationForm = true;
          this.loading = false;
        } else {
          this.notificator.showRPCError(error);
        }
      });
    });
  }

  add() {
    const applicationMail: ApplicationMail = new ApplicationMail();
    applicationMail.formId = this.applicationForm.id;
    const dialog = this.dialog.open(AddEditNotificationDialogComponent, {
      width: '1400px',
      height: '700px',
      data: {voId: this.voId,
        groupId: this.groupId,
        createMailNotification: true,
        applicationMail: applicationMail,
        applicationMails: this.applicationMails}
    });
    dialog.afterClosed().subscribe( success => {
      if (success) {
        this.translate.get('GROUP_DETAIL.SETTINGS.NOTIFICATIONS.ADD_SUCCESS').subscribe( text => {
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
      data: {voId: this.voId, groupId: this.groupId, mails: this.selection.selected}
    });
    dialog.afterClosed().subscribe( success => {
      if (success) {
        this.translate.get('GROUP_DETAIL.SETTINGS.NOTIFICATIONS.DELETE_SUCCESS').subscribe( text => {
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
      data: {voId: this.voId, groupId: this.groupId}
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
    this.registrarService.getApplicationMailsForGroup(this.groupId).subscribe( mails => {
      this.applicationMails = mails;
      this.loading = false;
    });
  }

  changeEmailFooter() {
    this.dialog.open(EditEmailFooterDialogComponent, {
      width: '500px',
      data: {voId: this.voId, groupId: this.groupId}
    });
  }

  changeSelection(selection: SelectionModel<ApplicationMail>) {
    this.selection = selection;
  }

  createEmptyApplicationForm() {
    this.registrarService.createApplicationForm(this.groupId).subscribe( () => {
      this.noApplicationForm = false;
      this.ngOnInit();
    });
  }
}
