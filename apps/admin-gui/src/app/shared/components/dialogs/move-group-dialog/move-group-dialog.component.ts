import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {openClose} from '../../../animations/Animations';
import {GroupFlatNode} from '../../../../vos/components/groups-tree/groups-tree.component';
import {NotificatorService} from '../../../../core/services/common/notificator.service';
import {TranslateService} from 'ngx-polygloat';
import { GroupService } from '@perun-web-apps/perun/services';
import { Group } from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService } from '../../../../core/services/api/api-request-configuration.service';

export interface MoveGroupDialogData {
  group: GroupFlatNode;
  theme: string;
}

@Component({
  selector: 'app-move-group-dialog',
  templateUrl: './move-group-dialog.component.html',
  styleUrls: ['./move-group-dialog.component.scss'],
  animations: [
    openClose
  ]
})
export class MoveGroupDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<MoveGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MoveGroupDialogData,
    private groupService: GroupService,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private apiRequest: ApiRequestConfigurationService
  ) {
    this.translate.get('DIALOGS.MOVE_GROUP.SUCCESS').subscribe(value => this.successMessage = value);
    this.translate.get('DIALOGS.MOVE_GROUP.ERROR').subscribe(value => this.errorMessage = value);
  }

  successMessage: string;
  errorMessage: string;

  toRootOptionDisabled = false;
  toGroupOptionDisabled = false;

  otherGroups: Group[] = [];
  filteredGroups: Observable<Group[]>;
  otherGroupsCtrl = new FormControl();
  moveOption: 'toGroup' | 'toRoot';
  loading = false;

  ngOnInit() {
    this.groupService.getAllGroups(this.data.group.voId).subscribe(allGroups => {
      this.otherGroups = allGroups.filter(group => group.id !== this.data.group.id && group.name !== 'members');
      if (this.data.group.parentGroupId === null) {
        this.toRootOptionDisabled = true;
        this.moveOption = 'toGroup';
      }
      this.filteredGroups = this.otherGroupsCtrl.valueChanges
        .pipe(
          startWith(''),
          map(group => group ? this._filterGroups(group) : this.otherGroups.slice())
        );
    });
  }

  // Hack that ensures proper autocomplete value displaying
  displayFn(group: Group): string | Group {
    return group ? group.name : group;
  }

  private _filterGroups(value: any): Group[] {
    // Hack that ensures proper autocomplete value displaying
    if (typeof value === 'object') {
      return [];
    }

    const filterValue = value.toLowerCase();

    return value ? this.otherGroups.filter(group => group.name.toLowerCase().indexOf(filterValue) > -1) : this.otherGroups;
  }

  close() {
    this.dialogRef.close();
  }

  confirm() {
    this.loading = true;
    // FIXME this might not work in case of some race condition (other request finishes sooner)
    this.apiRequest.dontHandleErrorForNext();
    this.groupService.moveGroup(
      this.data.group.id,
      this.otherGroupsCtrl.value ? this.otherGroupsCtrl.value.id : undefined,
      false).subscribe(() => {
      this.notificator.showSuccess(this.successMessage);
      this.dialogRef.close(true);
    }, (error => {
      this.notificator.showRPCError(error, this.errorMessage);
      this.dialogRef.close(false);
    }));
  }
}
