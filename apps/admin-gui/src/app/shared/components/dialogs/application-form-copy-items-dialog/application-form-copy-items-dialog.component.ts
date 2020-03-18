import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {TranslateService} from 'ngx-polygloat';
import {AbstractControl, FormControl, ValidatorFn, Validators} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import { GroupService, RegistrarService, VoService } from '@perun-web-apps/perun/services';
import { Group, Vo } from '@perun-web-apps/perun/openapi';

export interface ApplicationFormCopyItemsDialogData {
  voId: number;
  groupId: number;
}

@Component({
  selector: 'app-application-form-copy-items-dialog',
  templateUrl: './application-form-copy-items-dialog.component.html',
  styleUrls: ['./application-form-copy-items-dialog.component.scss']
})
export class ApplicationFormCopyItemsDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ApplicationFormCopyItemsDialogComponent>,
              private voService: VoService,
              private groupService: GroupService,
              private translateService: TranslateService,
              private registrarService: RegistrarService,
              @Inject(MAT_DIALOG_DATA) public data: ApplicationFormCopyItemsDialogData) { }

  vos: Vo[] = [];
  groups: Group[] = [];
  fakeGroup: Group;
  voControl = new FormControl();
  filteredVos: Observable<Vo[]>;
  groupControl = new FormControl();
  filteredGroups: Observable<Group[]>;

  ngOnInit() {
    this.translateService.get('DIALOGS.APPLICATION_FORM_COPY_ITEMS.NO_GROUP_SELECTED').subscribe( text => {
      this.fakeGroup = {
        id: -1,
        name: text,
        voId: 0,
        parentGroupId: 0,
        shortName: '',
        description: '',
        beanName: 'group'
      };
      this.groupControl.setValue(this.fakeGroup);

      this.voService.getAllVos().subscribe(vos => {
        this.vos = vos;

        this.voControl = new FormControl('', [this.invalidVo(this.vos), Validators.required]);

        this.filteredVos = this.voControl.valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value.name),
            map(name => name ? this._filterVo(name) : this.vos.slice())
          );

        this.vos = vos.sort(((vo1, vo2) => {
          if (vo1.name > vo2.name) {
            return 1;
          }

          if (vo1.name < vo2.name) {
            return -1;
          }

          return 0;
        }));
      });
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }

  _filterVo(value: string): Vo[] {
    const filterValue = value.toLowerCase();

    return this.vos.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  _filterGroup(value: string): Group[] {
    const filterValue = value.toLowerCase();

    return this.groups.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  displayFn(entity?: any): string | undefined {
    return entity ? entity.name : undefined;
  }

  submit() {
    if (this.data.groupId) {      // checking if the dialog is for group or Vo
      if (this.groupControl.value === this.fakeGroup) {   // no group selected
        this.registrarService.copyFormFromVoToGroup(this.voControl.value.id, this.data.groupId).subscribe( () => {
          this.dialogRef.close(true);
        });
      } else {
        this.registrarService.copyFormFromGroupToGroup(this.groupControl.value.id, this.data.groupId).subscribe( () => {
          this.dialogRef.close(true);
        });
      }
    } else {
      if (this.groupControl.value === this.fakeGroup) {       // no group selected
        this.registrarService.copyFormFromVoToVo(this.voControl.value.id, this.data.voId).subscribe( () => {
          this.dialogRef.close(true);
        });
      } else {
        this.registrarService.copyFormFromGroupToVo(this.groupControl.value.id, this.data.voId).subscribe( () => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  getGroups() {
    if (!this.voControl.invalid) {
      this.groupService.getAllGroups(this.voControl.value.id).subscribe( groups => {
        this.groups = [this.fakeGroup].concat(groups);
        this.groupControl.setValidators([this.invalidGroup(this.groups), Validators.required]);
        this.filteredGroups = this.groupControl.valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value.name),
            map(name => name ? this._filterGroup(name) : this.groups.slice())
          );
      });
    } else {
      this.groups = [this.fakeGroup];
    }
  }

  invalidVo(vos: Vo[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      let invalid = false;
      if (control.value) {
        if (control.value.beanName) {
          if (control.value.beanName !== 'Vo') {
            invalid = true;
          }
        } else {
          const vo = vos.find(x => x.name.toLowerCase() === control.value.toLowerCase());
          if (!vo) {
            invalid = true;
          } else {
            control.setValue(vo);
          }
        }
      }
      return invalid ? {'invalidVo': true} : null;
    };
  }

  invalidGroup(groups: Group[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      let invalid = false;
      if (control.value) {
        if (control.value.beanName) {
          if (control.value.beanName !== 'Group') {
            invalid = true;
          }
        } else if (control.value === this.fakeGroup) {
          invalid = false;
        } else {
          const group = groups.find(x => x.name.toLowerCase() === control.value.toLowerCase());
          if (!group) {
            invalid = true;
          } else {
            control.setValue(group);
          }
        }
      }
      return invalid ? {'invalidGroup': true} : null;
    };
  }
}
