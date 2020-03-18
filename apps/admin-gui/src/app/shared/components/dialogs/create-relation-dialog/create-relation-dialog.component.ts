import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Group } from '@perun-web-apps/perun/openapi';
import { GroupService } from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { NotificatorService } from '../../../../core/services/common/notificator.service';
import { TranslateService } from 'ngx-polygloat';

export interface CreateRelationDialogData {
  theme: string,
  groups: Group[],
  groupId: number,
  voId: number,
  reverse: boolean
}

@Component({
  selector: 'app-create-relation-dialog',
  templateUrl: './create-relation-dialog.component.html',
  styleUrls: ['./create-relation-dialog.component.scss']
})
export class CreateRelationDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CreateRelationDialogComponent>,
              private groupService: GroupService,
              private notificator: NotificatorService,
              private translate: TranslateService,
              @Inject(MAT_DIALOG_DATA) public data: CreateRelationDialogData
  ) {
    translate.get('DIALOGS.CREATE_RELATION.SUCCESS').subscribe(value => this.successMessage = value);
  }

  successMessage: string;
  selection = new SelectionModel<Group>(false, []);
  groups: Group[];
  theme: string;
  hideColumns = ['vo', 'menu'];
  filterValue = '';
  loading:boolean;

  ngOnInit() {
    this.loading = true;
    this.groupService.getUnions(this.data.groupId, !this.data.reverse).subscribe( unionGroups => {
      unionGroups = unionGroups.concat(this.data.groups);
      this.groupService.getAllGroups(this.data.voId).subscribe(allGroups => {
        const groupIds = unionGroups.map(elem => elem.id);
        this.groups = allGroups.filter(group => !groupIds.includes(group.id) && group.id !== this.data.groupId);
        this.loading = false;
      });
    });
    this.theme = this.data.theme;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    this.groupService.createUnion(this.data.groupId, this.selection.selected[0].id).subscribe(() =>{
      this.notificator.showSuccess(this.successMessage);
      this.loading = false;
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

}
