import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {
  UpdateApplicationFormDialogComponent
} from '../../../../../shared/components/dialogs/update-application-form-dialog/update-application-form-dialog.component';
import {NotificatorService} from '../../../../../core/services/common/notificator.service';
import {TranslateService} from 'ngx-polygloat';
import {
  ApplicationFormCopyItemsDialogComponent
} from '../../../../../shared/components/dialogs/application-form-copy-items-dialog/application-form-copy-items-dialog.component';
import {
  AddApplicationFormItemDialogComponent
} from '../../../../../shared/components/dialogs/add-application-form-item-dialog/add-application-form-item-dialog.component';
import {
  EditApplicationFormItemDialogComponent
} from '../../../../../shared/components/dialogs/edit-application-form-item-dialog/edit-application-form-item-dialog.component';
import { RegistrarService } from '@perun-web-apps/perun/services';
import { ApplicationForm } from '@perun-web-apps/perun/openapi';
import { ApplicationFormItem } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-vo-settings-application-form',
  templateUrl: './vo-settings-application-form.component.html',
  styleUrls: ['./vo-settings-application-form.component.scss']
})
export class VoSettingsApplicationFormComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private registrarService: RegistrarService,
              protected route: ActivatedRoute,
              private dialog: MatDialog,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private router: Router) { }

  loading = false;
  applicationForm: ApplicationForm;
  applicationFormItems: ApplicationFormItem[] = [];
  voId: number;

  ngOnInit() {
    this.loading = true;
    this.route.parent.parent.params.subscribe(params => {
      const voId = params['voId'];
      this.voId = voId;
      this.registrarService.getApplicationFormForVo(voId).subscribe( form => {
        this.applicationForm = form;
        this.registrarService.getFormItemsForVo(voId).subscribe( formItems => {
          this.applicationFormItems = formItems;
          this.loading = false;
        });
      });
    });
  }

  add() {
    const dialog = this.dialog.open(AddApplicationFormItemDialogComponent, {
      width: '500px',
      data: {voId: this.voId, applicationFormItems: this.applicationFormItems}
    });
    dialog.afterClosed().subscribe( success => {
      if (success) {
        this.registrarService.getFormItemsForVo(this.voId).subscribe( formItems => {
          this.applicationFormItems = formItems;
          const editDialog = this.dialog.open(EditApplicationFormItemDialogComponent, {
            width: '600px',
            height: '600px',
            data: {voId: this.voId, applicationFormItem: formItems[success.ordnum], applicationFormItems: this.applicationFormItems}
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
      data: {voId: this.voId}
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
        this.translate.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.CHANGE_SETTINGS_SUCCESS').subscribe( successMessage => {
          this.notificator.showSuccess(successMessage);
        });
        this.applicationForm = newForm;
      }
    });
  }

  preview() {
    this.router.navigate(['/organizations', this.voId, 'settings', 'applicationForm', 'preview']);
  }

  updateFormItems() {
    this.loading = true;
    this.registrarService.getFormItemsForVo(this.voId).subscribe( formItems => {
      this.applicationFormItems = formItems;
      this.loading = false;
    });
  }

  changeItems(applicationFormItemsChange: ApplicationFormItem[]) {
    this.applicationFormItems = applicationFormItemsChange;
  }
}
