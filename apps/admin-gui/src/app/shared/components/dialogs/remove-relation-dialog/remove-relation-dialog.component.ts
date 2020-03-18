import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource } from '@angular/material';
import { NotificatorService } from '../../../../core/services/common/notificator.service';
import { GroupService} from '@perun-web-apps/perun/services';
import { TranslateService } from 'ngx-polygloat';
import { Group} from '@perun-web-apps/perun/openapi';

export interface RemoveRelationDialogData {
  groups: Group[],
  theme: string;
  groupId: number;
  reverse: boolean
}

@Component({
  selector: 'app-remove-relation-dialog',
  templateUrl: './remove-relation-dialog.component.html',
  styleUrls: ['./remove-relation-dialog.component.scss']
})
export class RemoveRelationDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<RemoveRelationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: RemoveRelationDialogData,
    private notificator: NotificatorService,
    private groupService: GroupService,
    private translate: TranslateService
  ) {
    translate.get('DIALOGS.REMOVE_RELATION.SUCCESS').subscribe(value => this.successMessage = value);
  }

  successMessage: string;
  theme: string;
  loading: boolean;

  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Group>;

  ngOnInit() {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<Group>(this.data.groups);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    if(this.data.groups.length === 1){
      const thisGroup = this.data.reverse ? this.data.groups[0].id : this.data.groupId;
      const otherGroup = this.data.reverse ? this.data.groupId : this.data.groups[0].id;
      this.groupService.removeUnion(thisGroup, otherGroup).subscribe(() => {
        this.notificator.showSuccess(this.successMessage);
        this.loading = false;
        this.dialogRef.close(true);
      }, () => this.loading = false);
    }else {
      const thisGroup = this.data.reverse ? this.data.groups.shift().id : this.data.groupId;
      const otherGroup = this.data.reverse ? this.data.groupId : this.data.groups.shift().id;
      this.groupService.removeUnion(thisGroup, otherGroup).subscribe(() => {
        this.onSubmit();
        this.dialogRef.close(true);
      }, () => this.loading = false);
    }


  }

}
