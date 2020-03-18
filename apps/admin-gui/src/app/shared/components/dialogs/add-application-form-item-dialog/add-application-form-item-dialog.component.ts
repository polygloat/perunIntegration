import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {TranslateService} from 'ngx-polygloat';
import {NotificatorService} from '../../../../core/services/common/notificator.service';
import { ApplicationFormItem } from '@perun-web-apps/perun/models';
import { RegistrarService } from '@perun-web-apps/perun/services';

export interface AddApplicationFormItemDialogComponentData {
  voId: number;
  groupId: number;
  applicationFormItems: ApplicationFormItem[];
}

@Component({
  selector: 'app-add-application-form-item-dialog',
  templateUrl: './add-application-form-item-dialog.component.html',
  styleUrls: ['./add-application-form-item-dialog.component.scss']
})
export class AddApplicationFormItemDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<AddApplicationFormItemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: AddApplicationFormItemDialogComponentData,
              private translateService: TranslateService,
              private notificationService: NotificatorService,
              private registrarService: RegistrarService) { }

  shortName = '';
  items: string[] = [];
  selectedItem: string;
  selectedWidget = 'HEADING';
  widgets = ['HEADING', 'FROM_FEDERATION_HIDDEN', 'HTML_COMMENT', 'TEXTFIELD', 'FROM_FEDERATION_SHOW', 'VALIDATED_EMAIL', 'USERNAME',
            'PASSWORD', 'SELECTIONBOX', 'TEXTAREA', 'COMBOBOX', 'CHECKBOX', 'SUBMIT_BUTTON', 'RADIO', 'TIMEZONE', 'AUTO_SUBMIT_BUTTON'];

  ngOnInit() {
    this.translateService.get('DIALOGS.APPLICATION_FORM_ADD_ITEM.INSERT_TO_BEGINNING').subscribe( text => {
      this.items.push(text);
      for (const item of this.data.applicationFormItems) {
        this.items.push(item.shortname);
      }
      this.selectedItem = text;
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }

  submit() {
    if (this.shortName === '') {
      this.translateService.get('DIALOGS.APPLICATION_FORM_ADD_ITEM.NO_SHORTNAME_ERROR').subscribe( text => {
        this.notificationService.showError(text);
        return;
      });
    } else {
      const item = this.createApplicationItem();
      if (this.data.groupId) {      // if dialog is for group
        this.registrarService.updateFormItemsForGroup(this.data.groupId, this.data.applicationFormItems).subscribe( () => {
          this.dialogRef.close(item);
        });
      } else {
        this.registrarService.updateFormItemsForVo(this.data.voId, this.data.applicationFormItems).subscribe( () => {
          this.dialogRef.close(item);
        });
      }
    }
  }

  createApplicationItem(): ApplicationFormItem {
    const newApplicationItem = new ApplicationFormItem();
    newApplicationItem.shortname = this.shortName;
    newApplicationItem.type = this.selectedWidget;
    if (this.selectedItem === this.items[0]) {
      this.data.applicationFormItems.splice(0, 0, newApplicationItem);
      this.increaseOrdnums(1);
      return newApplicationItem;
    }
    for (let i = 0; i < this.data.applicationFormItems.length; i++) {
      if (this.selectedItem === this.data.applicationFormItems[i].shortname) {
        newApplicationItem.ordnum = i + 1;
        this.data.applicationFormItems.splice(i + 1, 0, newApplicationItem);
        this.increaseOrdnums(i + 2);
        return newApplicationItem;
      }
    }
  }

  increaseOrdnums(index: number) {
    for (let i = index; i < this.data.applicationFormItems.length; i++) {
      this.data.applicationFormItems[i].ordnum++;
    }
  }
}


