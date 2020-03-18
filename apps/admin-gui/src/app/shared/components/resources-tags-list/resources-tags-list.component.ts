import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {NotificatorService} from '../../../core/services/common/notificator.service';
import {TranslateService} from 'ngx-polygloat';
import { ResourcesService } from '@perun-web-apps/perun/services';
import { ResourceTag } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-resources-tags-list',
  templateUrl: './resources-tags-list.component.html',
  styleUrls: ['./resources-tags-list.component.scss']
})
export class ResourcesTagsListComponent implements OnChanges, AfterViewInit {

  constructor( private resourceService: ResourcesService,
               private notificator: NotificatorService,
               private translator: TranslateService) { }

  @Input()
  resourceTags: ResourceTag[] = [];

  @Input()
  filterValue: string;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  private sort: MatSort;

  displayedColumns: string[] = ['select', 'id', 'name', 'edit'];
  dataSource: MatTableDataSource<ResourceTag>;

  @Input()
  selection = new SelectionModel<ResourceTag>(true, []);

  isChanging = new SelectionModel<ResourceTag>(true, []);
  exporting = false;

  ngOnChanges(changes: SimpleChanges) {
    this.dataSource = new MatTableDataSource<ResourceTag>(this.resourceTags);
    this.setDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.filter = this.filterValue;
    }
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
  }

  checkboxLabel(row?: ResourceTag): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  save(tag: ResourceTag) {
    this.resourceService.updateResourceTag(tag).subscribe( () => {
      this.translator.get('SHARED.COMPONENTS.RESOURCES_TAGS_LIST.EDIT_SUCCESS').subscribe( text => {
        this.notificator.showSuccess(text);
      });
      this.isChanging.deselect(tag);
    });
  }

  edit(row?: ResourceTag) {
    this.isChanging.select(row);
  }

}
