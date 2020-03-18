import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource} from '@angular/material';
import {NotificatorService} from '../../../../core/services/common/notificator.service';
import {TranslateService} from 'ngx-polygloat';
import { AttrEntity } from '@perun-web-apps/perun/models';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';

export interface DeleteAttributeDialogData {
  entityId: number;
  entity: AttrEntity;
  attributes: Attribute[];
  secondEntity ?: AttrEntity;
  secondEntityId ?: number;
}

@Component({
  selector: 'app-delete-attribute-dialog',
  templateUrl: './delete-attribute-dialog.component.html',
  styleUrls: ['./delete-attribute-dialog.component.scss']
})
export class DeleteAttributeDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DeleteAttributeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DeleteAttributeDialogData,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private attributesManager: AttributesManagerService,
              ) {
  }

  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Attribute>;

  ngOnInit() {
    this.dataSource = new MatTableDataSource<Attribute>(this.data.attributes);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    const ids: number[] = [];
    for (const attr of this.data.attributes) {
      ids.push(attr.id);
    }

    const payload: any = {};

    payload[this.data.entity] = this.data.entityId;
    payload['attributes'] = ids;

    if (this.data.secondEntity !== undefined) {
      payload[this.data.secondEntity] = this.data.secondEntityId;
    }

    if (this.data.secondEntity === undefined) {
      if (this.data.entity === 'vo') {
        this.attributesManager.removeVoAttributes(this.data.entityId, ids).subscribe(() => {
          this.onSuccess();
        })
      } else if (this.data.entity === 'group') {
        this.attributesManager.removeGroupAttributes(this.data.entityId, ids).subscribe(() => {
          this.onSuccess();
        })
      } else if (this.data.entity === 'user') {
        this.attributesManager.removeUserAttributes(this.data.entityId, ids).subscribe(() => {
          this.onSuccess();
        })
      } else if (this.data.entity === 'member') {
        this.attributesManager.removeMemberAttributes(this.data.entityId, ids).subscribe(() => {
          this.onSuccess();
        })
      } else if (this.data.entity === 'facility') {
        this.attributesManager.removeFacilityAttributes(this.data.entityId, ids).subscribe(() => {
          this.onSuccess();
        })
      }
    } else {
      // TODO handle attributes for two entities
    }
  }

  onSuccess() {
      this.translate.get('DIALOGS.DELETE_ATTRIBUTES.SUCCESS').subscribe(successMessage => {
        this.notificator.showSuccess(successMessage);
        this.dialogRef.close(true);
      });
  }
}
