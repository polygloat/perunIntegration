import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource} from '@angular/material';
import {NotificatorService} from '../../../../core/services/common/notificator.service';
import {TranslateService} from 'ngx-polygloat';
import { RichMember } from '@perun-web-apps/perun/openapi';
import { GroupService, MembersService } from '@perun-web-apps/perun/services';

export interface RemoveMembersDialogData {
  members: RichMember[];
  groupId?: number;
}
@Component({
  selector: 'app-remove-members-dialog',
  templateUrl: './remove-members-dialog.component.html',
  styleUrls: ['./remove-members-dialog.component.scss']
})
export class RemoveMembersDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RemoveMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemoveMembersDialogData,
    private membersService: MembersService,
    private groupService: GroupService,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) { }

  displayedColumns: string[] = ['id', 'name'];
  dataSource: MatTableDataSource<RichMember>;

  loading: boolean;

  ngOnInit() {
    this.dataSource = new MatTableDataSource<RichMember>(this.data.members);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    if (!!this.data.groupId) {
      this.groupService.removeMembers(this.data.groupId, this.data.members.map(m => m.id))
        .subscribe(() => this.onSuccess(), () => this.onError());
    } else {
      this.membersService.deleteMembers(this.data.members.map(m => m.id))
        .subscribe(() => this.onSuccess(), () => this.onError());
    }
  }

  onSuccess() {
    const message = !!this.data.groupId ?
      this.translate.instant('DIALOGS.REMOVE_MEMBERS.SUCCESS_GROUP'):
      this.translate.instant('DIALOGS.REMOVE_MEMBERS.SUCCESS');
    this.notificator.showSuccess(message);
    this.dialogRef.close(true);
    this.loading = false;
  }

  onError() {
    this.loading = false;
  }
}
