import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ResourcesService, VoService } from '@perun-web-apps/perun/services';
import { Vo } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { NotificatorService } from '../../../../core/services/common/notificator.service';
import { TranslateService } from 'ngx-polygloat';

export interface CreateResourceDialogData {
  theme: string;
  facilityId: number;
}

@Component({
  selector: 'app-create-resource-dialog',
  templateUrl: './create-resource-dialog.component.html',
  styleUrls: ['./create-resource-dialog.component.scss']
})
export class CreateResourceDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CreateResourceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: CreateResourceDialogData,
              private notificator: NotificatorService,
              private voService: VoService,
              private translate: TranslateService,
              private resourcesService: ResourcesService
  ) {
    translate.get('DIALOGS.CREATE_RESOURCE.SUCCESS').subscribe(value => this.successMessage = value);
  }

  nameCtrl: FormControl;
  descriptionCtrl: FormControl;
  organizationCtrl: FormControl = new FormControl();
  vos: Vo[] = [];
  filteredVos: Observable<Vo[]>;

  theme: string;
  loading: boolean;
  selectedVo: Vo = null;
  successMessage: string;

  ngOnInit() {
    this.theme = this.data.theme;
    this.voService.getAllVos().subscribe(vos => {
      this.vos = vos;

      this.filteredVos = this.organizationCtrl.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    });

    this.nameCtrl = new FormControl(null, [Validators.required, Validators.pattern('.*[\\S]+.*')]);
    this.descriptionCtrl = new FormControl(null, [Validators.required, Validators.pattern('.*[\\S]+.*')]);
  }

  _filter(value: string): Vo[] {
    const filterValue = value.toLowerCase();
    return this.vos.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  onSubmit() {
    this.loading = true;
    this.resourcesService.createResource(this.nameCtrl.value, this.descriptionCtrl.value, this.selectedVo.id, this.data.facilityId).subscribe(() => {
      this.notificator.showSuccess(this.successMessage);
      this.loading = false;
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
