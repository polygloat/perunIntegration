import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {
  AddEditNotificationDialogComponent
} from '../../../shared/components/dialogs/add-edit-notification-dialog/add-edit-notification-dialog.component';
import {TranslateService} from 'ngx-polygloat';
import {NotificatorService} from '../../../core/services/common/notificator.service';
import { RegistrarService } from '@perun-web-apps/perun/services';
import { ApplicationMail } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnChanges, AfterViewInit {

  constructor(private registrarService: RegistrarService,
              private translate: TranslateService,
              private notificator: NotificatorService,
              private dialog: MatDialog) { }

  @Input()
  applicationMails: ApplicationMail[];

  @Input()
  voId: number;

  @Input()
  groupId: number;

  displayedColumns: string[] = ['select', 'id', 'mailType', 'appType', 'send'];
  dataSource: MatTableDataSource<ApplicationMail>;

  @Input()
  selection = new SelectionModel<ApplicationMail>(true, []);

  @Output()
  selectionChange = new EventEmitter<SelectionModel<ApplicationMail>>();

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  private sort: MatSort;

  ngOnChanges() {
    this.dataSource = new MatTableDataSource<ApplicationMail>(this.applicationMails);
    this.setDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
    this.selectionChange.emit(this.selection);
  }

  checkboxLabel(row?: ApplicationMail): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  changeSending(applicationMail: ApplicationMail) {
    if (applicationMail.send) {
      this.registrarService.setSendingEnabled(0, [applicationMail]).subscribe( () => {
        applicationMail.send = false;
      });
    } else {
      this.registrarService.setSendingEnabled(1, [applicationMail]).subscribe( () => {
        applicationMail.send = true;
      });
    }
  }

  openApplicationMailDetail(applicationMail: ApplicationMail) {
    const dialog = this.dialog.open(AddEditNotificationDialogComponent, {
      width: '1400px',
      height: '700px',
      data: {voId: this.voId, groupId: this.groupId, createMailNotification: false, applicationMail: applicationMail}
    });
    dialog.afterClosed().subscribe( success => {
      if (success) {
        this.translate.get('VO_DETAIL.SETTINGS.NOTIFICATIONS.EDIT_SUCCESS').subscribe( text => {
          this.notificator.showSuccess(text);
        });
        this.selection.clear();
        this.selectionChange.emit(this.selection);
        this.update();
      }
    });
  }

  getMailType(applicationMail: ApplicationMail): string {
    let value = '';
    if (applicationMail.mailType === undefined || applicationMail.mailType === null || applicationMail.mailType === '') {
      value = '';
    } else {
      this.translate.get('VO_DETAIL.SETTINGS.NOTIFICATIONS.MAIL_TYPE_' + applicationMail.mailType).subscribe( text => {
        value = text;
      });
    }
    return value;
  }

  update() {
    if (this.groupId) {
      this.registrarService.getApplicationMailsForGroup(this.groupId).subscribe( mails => {
        this.updateTable(mails);
      });
    } else {
      this.registrarService.getApplicationMailsForVo(this.voId).subscribe( mails => {
        this.updateTable(mails);
      });
    }
  }

  toggle(row: any) {
    this.selection.toggle(row);
    this.selectionChange.emit(this.selection);
  }

  updateTable(mails: ApplicationMail[]) {
    this.applicationMails = mails;
    this.dataSource = new MatTableDataSource<ApplicationMail>(this.applicationMails);
    this.setDataSource();
  }

  private setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }
}
