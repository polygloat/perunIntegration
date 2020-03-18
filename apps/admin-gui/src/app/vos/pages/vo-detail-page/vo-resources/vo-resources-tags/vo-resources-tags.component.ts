import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {
  CreateResourceTagDialogComponent
} from '../../../../../shared/components/dialogs/create-resource-tag-dialog/create-resource-tag-dialog.component';
import {
  DeleteResourceTagDialogComponent
} from '../../../../../shared/components/dialogs/delete-resource-tag-dialog/delete-resource-tag-dialog.component';
import {TranslateService} from 'ngx-polygloat';
import {NotificatorService} from '../../../../../core/services/common/notificator.service';
import { ResourcesService } from '@perun-web-apps/perun/services';
import { ResourceTag } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-vo-resources-tags',
  templateUrl: './vo-resources-tags.component.html',
  styleUrls: ['./vo-resources-tags.component.scss']
})
export class VoResourcesTagsComponent implements OnInit {
  @HostBinding('class.router-component') true;

  constructor(private route: ActivatedRoute,
              private resourceService: ResourcesService,
              private dialog: MatDialog,
              private notificator: NotificatorService,
              private translator: TranslateService) { }

  loading = false;
  resourceTag: ResourceTag[] = [];
  voId: number;

  selection = new SelectionModel<ResourceTag>(true, []);

  filterValue: string;

  ngOnInit() {
    this.route.parent.parent.params.subscribe(parentParams => {
      this.voId = parentParams['voId'];
      this.updateData();
    });
  }

  deleteTag() {
    const dialogRef = this.dialog.open(DeleteResourceTagDialogComponent, {
      width: '450px',
      data: {tagsForDelete: this.selection.selected}
    });

    dialogRef.afterClosed().subscribe( success => {
      if (success) {
        this.translator.get('VO_DETAIL.RESOURCES.TAGS.DELETE_SUCCESS').subscribe( text => {
          this.notificator.showSuccess(text);
        });
        this.updateData();
      }
    });
  }

  create() {
    const dialogRef = this.dialog.open(CreateResourceTagDialogComponent, {
      width: '450px',
      data: {voId: this.voId}
    });

    dialogRef.afterClosed().subscribe( success => {
      if (success) {
        this.translator.get('VO_DETAIL.RESOURCES.TAGS.CREATE_SUCCESS').subscribe( text => {
          this.notificator.showSuccess(text);
        });
        this.updateData();
      }
    });
  }
  updateData() {
    this.loading = true;
    this.selection.clear();
    this.resourceService.getAllResourcesTagsForVo(this.voId).subscribe(tags => {
      this.resourceTag = tags;
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }
}
