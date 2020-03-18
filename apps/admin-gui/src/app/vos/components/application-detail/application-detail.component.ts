import { Component, HostBinding, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { TranslateService } from 'ngx-polygloat';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationReSendNotificationDialogComponent } from '../../../shared/components/dialogs/application-re-send-notification-dialog/application-re-send-notification-dialog.component';
import { ApplicationRejectDialogComponent } from '../../../shared/components/dialogs/application-reject-dialog/application-reject-dialog.component';
import { NotificatorService } from '../../../core/services/common/notificator.service';
import { RegistrarService } from '@perun-web-apps/perun/services';
import { Application, ApplicationFormItem, ApplicationFormItemData } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit {

  // used for router animation
  @HostBinding('class.router-component') true;

  constructor(private registrarService: RegistrarService,
              private dialog: MatDialog,
              private translate: TranslateService,
              private route: ActivatedRoute,
              private notificator: NotificatorService,
              private router: Router) { }

  application: Application;
  userData: ApplicationFormItemData[] = [];
  displayedColumns: string[] = ['label', 'value'];
  dataSource: MatTableDataSource<ApplicationFormItemData>;
  loading = true;

  ngOnInit() {
    this.loading = true;
    this.route.params.subscribe(parentParams => {
      const applicationId = parentParams['applicationId'];
      this.registrarService.getApplicationById(applicationId).subscribe(application => {
        this.application = application;
        this.registrarService.getApplicationDataById(this.application.id).subscribe(value => {
          this.userData = value;
          this.dataSource = new MatTableDataSource<ApplicationFormItemData>(this.userData);
          this.loading = false;
        });
      });
    });
  }

  getLabel(formItem: ApplicationFormItem) {
    if (formItem.i18n['en'].label !== null) {
      if (formItem.i18n['en'].label.length !== 0) {
        return formItem.i18n['en'].label; // prerobit na ne en
      }
    }
    return formItem.shortname;
  }

  submittedBy() {
    return this.application.createdBy.slice(this.application.createdBy.lastIndexOf('=') + 1, this.application.createdBy.length);
  }

  getModifiedAtName(modifiedBy: string) {
    const index = modifiedBy.lastIndexOf('/CN=');
    if (index !== -1) {
      const string =  modifiedBy.slice(index + 4, modifiedBy.length).replace('/unstructuredName=', ' ');
      if (string.lastIndexOf('\\') !== -1) {
        return modifiedBy.slice(modifiedBy.lastIndexOf('=') + 1, modifiedBy.length);
      }
      return string;
    }
    return modifiedBy;
  }

  resendNotification() {
    this.dialog.open(ApplicationReSendNotificationDialogComponent, {
      width: '500px',
      data: {applicationId: this.application.id}
    });
  }

  deleteApplication() {
    this.registrarService.deleteApplication(this.application.id).subscribe(any => {
      this.translate.get('VO_DETAIL.APPLICATION.APPLICATION_DETAIL.DELETE_MESSAGE').subscribe(successMessage => {
        this.notificator.showSuccess(successMessage);
        this.router.navigateByUrl(this.router.url.substring(0, this.router.url.lastIndexOf('/')));
      });
    });
  }

  rejectApplication() {
    const dialogRef = this.dialog.open(ApplicationRejectDialogComponent, {
      width: '500px',
      data: {applicationId: this.application.id}
    });

    dialogRef.afterClosed().subscribe(value => {
      this.loading = true;
      this.registrarService.getApplicationById(this.application.id).subscribe(reloaded => {
        this.application = reloaded;
        this.loading = false;
      });
    });
  }

  approveApplication() {
    this.registrarService.approveApplication(this.application.id).subscribe( application => {
      this.translate.get('VO_DETAIL.APPLICATION.APPLICATION_DETAIL.APPROVE_MESSAGE').subscribe(successMessage => {
        this.notificator.showSuccess(successMessage);
      });
      this.loading = true;
      this.registrarService.getApplicationById(this.application.id).subscribe(reloaded => {
        this.application = reloaded;
        this.loading = false;
      });
    });
  }

  verifyApplication() {
    this.registrarService.verifyApplication(this.application.id).subscribe(application => {
      this.translate.get('VO_DETAIL.APPLICATION.APPLICATION_DETAIL.VERIFY_MESSAGE').subscribe(successMessage => {
        this.notificator.showSuccess(successMessage);
      });
      this.loading = true;
      this.registrarService.getApplicationById(this.application.id).subscribe(reloaded => {
        this.application = reloaded;
        this.loading = false;
      });
    });
  }

}
