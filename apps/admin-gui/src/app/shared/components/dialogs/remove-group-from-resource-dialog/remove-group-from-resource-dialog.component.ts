import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource } from '@angular/material';
import { Group } from '@perun-web-apps/perun/openapi';
import { ResourcesService } from '@perun-web-apps/perun/services';
import { NotificatorService } from '../../../../core/services/common/notificator.service';
import { TranslateService } from 'ngx-polygloat';

export interface RemoveGroupFromResourceDialogData {
  resourceId: number;
  groups: Group[];
}

@Component({
  selector: 'app-perun-web-apps-remove-group-from-resource-dialog',
  templateUrl: './remove-group-from-resource-dialog.component.html',
  styleUrls: ['./remove-group-from-resource-dialog.component.scss']
})
export class RemoveGroupFromResourceDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<RemoveGroupFromResourceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: RemoveGroupFromResourceDialogData,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private resourceService: ResourcesService) { }

  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Group>;

  ngOnInit() {
    this.dataSource = new MatTableDataSource<Group>(this.data.groups);
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    const groupsId = [];
    for (const group of this.data.groups) {
      groupsId.push(group.id);
    }
    this.resourceService.removeGroupsFromResource(groupsId, this.data.resourceId).subscribe( () => {
      this.translate.get('DIALOGS.REMOVE_GROUP_FROM_RESOURCE.SUCCESS').subscribe(successMessage => {
        this.notificator.showSuccess(successMessage);
        this.dialogRef.close(true);
      });
    });
  }
}
