import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output, QueryList,
  SimpleChanges,
  ViewChild, ViewChildren
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { NotificatorService } from '../../../core/services/common/notificator.service';
import { TranslateService } from 'ngx-polygloat';
import { SelectionModel } from '@angular/cdk/collections';
import { AttributeDefinition } from '@perun-web-apps/perun/openapi';
import { AttributeValueComponent } from '../attributes-list/attribute-value/attribute-value.component';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';

export interface EntitylessAttributeKeysListData {
  attDef: AttributeDefinition;
}

@Component({
  selector: 'app-entityless-attribute-keys-list',
  templateUrl: './entityless-attribute-keys-list.component.html',
  styleUrls: ['./entityless-attribute-keys-list.component.scss']
})

export class EntitylessAttributeKeysListComponent implements OnChanges, OnInit {

  constructor(public dialogRef: MatDialogRef<EntitylessAttributeKeysListComponent>,
              @Inject(MAT_DIALOG_DATA) public data: EntitylessAttributeKeysListData,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private attributesManager: AttributesManagerService,
              ) {
  }

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  @Input()
  attDef: AttributeDefinition;

  @Output()
  switchView: EventEmitter<any> = new EventEmitter();

  @ViewChildren(AttributeValueComponent)
  items: QueryList<AttributeValueComponent>;

  private sort: MatSort;

  records: [string, Attribute][] = [];

  displayedColumns: string[] = ['select', 'key', 'value'];
  dataSource: MatTableDataSource<[string, Attribute]> = new MatTableDataSource<[string, Attribute]>();

  selection = new SelectionModel<[string, Attribute]>(true, []);

  isAddButtonDisabled = false;

  ngOnChanges(changes: SimpleChanges) {
    this.dataSource = new MatTableDataSource<[string, Attribute]>(this.records);
    this.setDataSource();
  }

  ngOnInit() {
    this.attDef = this.data.attDef;
    this.attributesManager.getEntitylessKeys(this.attDef.id).subscribe(keys => {
      this.attributesManager.getEntitylessAttributesByName(`${this.attDef.namespace}:${this.attDef.friendlyName}`).subscribe(att => {
        let i = 0;
        this.records = [];
        for (const key of keys) {
          this.records.push([key, att[i]]);
          i++;
        }
        this.dataSource = new MatTableDataSource<[string, Attribute]>(this.records);
        this.setDataSource();
      });
    });
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  onSave() {
    this.updateMapAttributes();
    for (const rec of this.selection.selected) {
      this.attributesManager.setEntitylessAttribute({key: rec[0], attribute: rec[1]}).subscribe(() => {
        this.translate.get('SHARED.COMPONENTS.ENTITYLESS_ATTRIBUTES_LIST.SAVE_SUCCESS').subscribe(message => {
          this.notificator.showSuccess(message);
          this.ngOnInit();
        });
      });
    }
    this.isAddButtonDisabled = false;
  }

  onRemove() {
    for (const rec of this.selection.selected) {
      this.attributesManager.removeEntitylessAttribute(rec[0], rec[1].id).subscribe(() => {
        this.translate.get('SHARED.COMPONENTS.ENTITYLESS_ATTRIBUTES_LIST.REMOVE_SUCCESS').subscribe(message => {
          this.notificator.showSuccess(message);
          this.ngOnInit();
        });
      });
    }
    this.ngOnInit();
    this.isAddButtonDisabled = false;
  }

  onAdd() {
    const rec = ['', this.attDef as Attribute] as [string, Attribute];
    rec[1].value = undefined;
    this.records.push(rec);
    this.ngOnChanges(undefined);
    this.selection.clear();
    this.selection.select(rec);
    this.isAddButtonDisabled = true;
    this.paginator.lastPage();
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: [string, Attribute]): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row[1].id + 1}`;
  }

  onValueChange(record: [string, Attribute]) {
    this.selection.select(record);
  }

  updateMapAttributes() {
    for (const item of this.items.toArray()) {
      if (item.attribute.type === 'java.util.LinkedHashMap') {
        item.updateMapAttribute();
      }
    }
  }

}
