import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {NotificatorService} from '../../../../../core/services/common/notificator.service';
import {TranslateService} from 'ngx-polygloat';
import {
  AddApplicationFormItemDialogComponent
} from '../../../../../shared/components/dialogs/add-application-form-item-dialog/add-application-form-item-dialog.component';
import {
  EditApplicationFormItemDialogComponent
} from '../../../../../shared/components/dialogs/edit-application-form-item-dialog/edit-application-form-item-dialog.component';
import {
  ApplicationFormCopyItemsDialogComponent
} from '../../../../../shared/components/dialogs/application-form-copy-items-dialog/application-form-copy-items-dialog.component';
import {
  UpdateApplicationFormDialogComponent
} from '../../../../../shared/components/dialogs/update-application-form-dialog/update-application-form-dialog.component';
import { RegistrarService } from '@perun-web-apps/perun/services';
import { ApplicationForm } from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService } from '../../../../../core/services/api/api-request-configuration.service';
import { ApplicationFormItem } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-group-settings-application-form',
  templateUrl: './group-settings-application-form.component.html',
  styleUrls: ['./group-settings-application-form.component.scss']
})
export class GroupSettingsApplicationFormComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private registrarService: RegistrarService,
              protected route: ActivatedRoute,
              private dialog: MatDialog,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private apiRequest: ApiRequestConfigurationService,
              private router: Router) { }

  loading = false;
  applicationForm: ApplicationForm;
  applicationFormItems: ApplicationFormItem[] = [];
  voId: number;
  groupId: number;
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
        this.registrarService.getFormItemsForGroup(this.groupId).subscribe( formItems => {
          this.applicationFormItems = formItems;
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
    const dialog = this.dialog.open(AddApplicationFormItemDialogComponent, {
      width: '500px',
      data: {voId: this.voId, groupId: this.groupId, applicationFormItems: this.applicationFormItems}
    });
    dialog.afterClosed().subscribe( success => {
      if (success) {
        this.registrarService.getFormItemsForGroup(this.groupId).subscribe( formItems => {
          this.applicationFormItems = formItems;
          const editDialog = this.dialog.open(EditApplicationFormItemDialogComponent, {
            width: '600px',
            height: '600px',
            data: {voId: this.voId,
              groupId: this.groupId,
              applicationFormItem: formItems[success.ordnum],
              applicationFormItems: this.applicationFormItems}
          });
          editDialog.afterClosed().subscribe(() => {
            this.updateFormItems();
          });
        });
      }
    });
  }

  copy() {
    const dialog = this.dialog.open(ApplicationFormCopyItemsDialogComponent, {
      width: '500px',
      data: {voId: this.voId, groupId: this.groupId}
    });
    dialog.afterClosed().subscribe( copyFrom => {
      if (copyFrom) {
        this.updateFormItems();
      }
    });
  }

  settings() {
    const dialog = this.dialog.open(UpdateApplicationFormDialogComponent, {
      width: '400px',
      data: {applicationForm: this.applicationForm}
    });
    dialog.afterClosed().subscribe( newForm => {
      if (newForm) {
        this.translate.get('GROUP_DETAIL.SETTINGS.APPLICATION_FORM.CHANGE_SETTINGS_SUCCESS').subscribe( successMessage => {
          this.notificator.showSuccess(successMessage);
        });
        this.applicationForm = newForm;
      }
    });
  }

  preview() {
    this.router.navigate(['/organizations', this.voId, 'groups', this.groupId, 'settings', 'applicationForm', 'preview']);
  }

  updateFormItems() {
    this.loading = true;
    this.registrarService.getFormItemsForGroup(this.groupId).subscribe( formItems => {
      this.applicationFormItems = formItems;
      this.loading = false;
    });
  }

  changeItems(applicationFormItemsChange: ApplicationFormItem[]) {
    this.applicationFormItems = applicationFormItemsChange;
  }

  createEmptyApplicationForm() {
    this.registrarService.createApplicationForm(this.groupId).subscribe( () => {
      this.noApplicationForm = false;
      this.ngOnInit();
    });
  }
}
