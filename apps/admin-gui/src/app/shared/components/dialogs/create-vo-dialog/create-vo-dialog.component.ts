import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { VoService } from '@perun-web-apps/perun/services';
import { NotificatorService } from '../../../../core/services/common/notificator.service';
import { TranslateService } from 'ngx-polygloat';
import { FormControl, Validators } from '@angular/forms';

export interface CreateVoDialogData {
  theme: string;
}

@Component({
  selector: 'app-create-vo-dialog',
  templateUrl: './create-vo-dialog.component.html',
  styleUrls: ['./create-vo-dialog.component.scss']
})
export class CreateVoDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<CreateVoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: CreateVoDialogData,
    private notificator: NotificatorService,
    private voService: VoService,
    private translate: TranslateService,
  ) {
    translate.get('DIALOGS.CREATE_VO.SUCCESS').subscribe(value => this.successMessage = value);
  }

  successMessage: string;
  loading: boolean;
  theme: string;

  shortNameCtrl: FormControl;
  fullNameCtrl: FormControl;

  ngOnInit() {
    this.theme = this.data.theme;
    this.shortNameCtrl = new FormControl(null, [Validators.required, Validators.pattern('^[\\w.-]+$'), Validators.maxLength(33)]);
    this.fullNameCtrl = new FormControl(null, [Validators.required, Validators.pattern('.*[\\S]+.*'), Validators.maxLength(129)]);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    this.voService.createVo(this.fullNameCtrl.value, this.shortNameCtrl.value).subscribe(() => {
      this.notificator.showSuccess(this.successMessage);
      this.loading = false;
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }
}
