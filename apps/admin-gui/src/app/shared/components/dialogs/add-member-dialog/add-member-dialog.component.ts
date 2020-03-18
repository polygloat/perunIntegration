import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { TranslateService } from 'ngx-polygloat';
import { NotificatorService } from '../../../../core/services/common/notificator.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { GroupService, MembersService, RegistrarService, VoService } from '@perun-web-apps/perun/services';
import { Group } from '@perun-web-apps/perun/openapi';
import { MemberCandidate } from '@perun-web-apps/perun/models';
import { Urns } from '@perun-web-apps/perun/urns';
import { getCandidateEmail } from '@perun-web-apps/perun/utils';

export interface AddMemberDialogData {
  voId?: number;
  entityId: number;
  group?: Group;
  theme: string;
  type: 'vo' | 'group';
}

@Component({
  selector: 'app-add-member-dialog',
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss']
})
export class AddMemberDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<AddMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddMemberDialogData,
    private memberService: MembersService,
    private groupService: GroupService,
    private voService: VoService,
    private registrarService: RegistrarService,
    private translate: TranslateService,
    private notificator: NotificatorService,
    protected route: ActivatedRoute,
    protected router: Router
  ) {
    translate.get('DIALOGS.ADD_MEMBERS.TITLE').subscribe(value => this.title = value);
    translate.get('DIALOGS.ADD_MEMBERS.SUCCESS').subscribe(value => this.successMessage = value);
    translate.get('DIALOGS.ADD_MEMBERS.SUCCESS_INVITE').subscribe(value => this.successInviteMessage = value);

  }

  title: string;
  searchString = '';
  successMessage: string;
  successInviteMessage: string;

  selection = new SelectionModel<MemberCandidate>(false, []);
  loading: boolean;
  processing: boolean;
  members: MemberCandidate[] = [];

  firstSearchDone = false;

  theme: string;

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    this.processing = true;
    // TODO Adds only one member at the time. In the future there would be need to add more
    const selectedMemberCandidate = this.selection.selected[0];

    if (this.data.type === 'vo') {
      if (!!selectedMemberCandidate.richUser) {
        this.addUserToVo(selectedMemberCandidate);
      } else {
        this.addCandidateToVo(selectedMemberCandidate);
      }
    } else if (this.data.type === 'group') {
      if (!!selectedMemberCandidate.member) {
        this.addMemberToGroup(selectedMemberCandidate);
      }
      else if (!!selectedMemberCandidate.richUser) {
        this.addUserToGroup(selectedMemberCandidate);
      }
      else if (!!selectedMemberCandidate.candidate) {
        this.addCandidateToGroup(selectedMemberCandidate);
      }
    }
  }

  onInvite(): void {

    // TODO Was not tested properly. Need to be tested on devel.
    if (this.selection.selected[0].richUser) {
      if (this.data.type === 'vo') {
        this.registrarService.sendInvitationToExistingUser(this.selection.selected[0].richUser.id, this.data.entityId).subscribe(() => {
          this.onInviteSuccess();
        });
      } else if (this.data.type === 'group') {
        this.registrarService.sendInvitationGroupToExistingUser(this.selection.selected[0].richUser.id, this.data.voId ,this.data.group.id).subscribe(() => {
          this.onInviteSuccess();
        });
      }
    } else {
      if (this.data.type === 'vo') {
        this.registrarService.sendInvitation(this.data.voId,
          getCandidateEmail(this.selection.selected[0].candidate)).subscribe( () => {
            this.onInviteSuccess();
        });
      } else if (this.data.type === 'group') {
        this.registrarService.sendInvitationForGroup(this.data.voId, this.data.group.id,
          getCandidateEmail(this.selection.selected[0].candidate)).subscribe( () => {
            this.onInviteSuccess();
        })
      }
    }

  }

  onSearchByString() {
    this.loading = true;

    this.selection.clear();

    // TODO properly test it on devel when possible.

    this.voService.getCompleteCandidates(
      this.data.entityId,
      this.data.type,
      [Urns.USER_DEF_ORGANIZATION, Urns.USER_DEF_PREFERRED_MAIL], this.searchString).subscribe(
      members => {
        this.members = members;
        this.loading = false;
        this.firstSearchDone = true;
      },
      () => this.loading = false
    );
  }

  ngOnInit(): void {
    this.theme = this.data.theme;
  }

  private addUserToVo(selectedMemberCandidate: MemberCandidate) {
    this.memberService.createMember(this.data.entityId, selectedMemberCandidate.richUser.id).subscribe(() => {
      this.onAddSuccess();
    }, () => this.onError());
  }

  private addCandidateToVo(selectedMemberCandidate: MemberCandidate) {
    this.memberService.createMemberForCandidate(
      this.data.entityId, selectedMemberCandidate.candidate).subscribe(() => {
      this.onAddSuccess();
    }, () => this.onError());
  }

  private addUserToGroup(selectedMemberCandidate: MemberCandidate) {
    this.memberService.createMemberWithGroups(
      this.data.voId, selectedMemberCandidate.richUser.id, [this.data.group]).subscribe(() => {
      this.onAddSuccess();
    }, () => this.onError());
  }

  private addMemberToGroup(selectedMemberCandidate: MemberCandidate) {
    this.groupService.addMembers(this.data.entityId, [selectedMemberCandidate.member.id]).subscribe(() => {
      this.onAddSuccess();
    }, () => this.onError());
  }

  private addCandidateToGroup(selectedMemberCandidate: MemberCandidate) {
    this.memberService.createMemberForCandidateWithGroups(
      this.data.voId, selectedMemberCandidate.candidate, [this.data.group]).subscribe(() => {
      this.onAddSuccess();
    }, () => this.onError());
  }

  private onAddSuccess() {
    this.translate.get('DIALOGS.ADD_MEMBERS.SUCCESS').subscribe(() => {
      this.notificator.showSuccess(this.successMessage);
      this.dialogRef.close();
    });
  }

  private onError() {
      this.processing = false;
  }

  private onInviteSuccess() {
    this.translate.get('DIALOGS.ADD_MEMBERS.SUCCESS_INVITE').subscribe(() => {
      this.notificator.showSuccess(this.successInviteMessage);
      this.dialogRef.close();
    });
  }
}
