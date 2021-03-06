import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {fadeIn} from '../../../shared/animations/Animations';
import {SideMenuService} from '../../../core/services/common/side-menu.service';
import {SideMenuItemService} from '../../../shared/side-menu/side-menu-item.service';
import { FacilityService, ResourcesService } from '@perun-web-apps/perun/services';
import { Resource } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-resource-detail-page',
  templateUrl: './resource-detail-page.component.html',
  styleUrls: ['./resource-detail-page.component.scss'],
  animations: [
    fadeIn
  ]
})
export class ResourceDetailPageComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private facilityService: FacilityService,
    private resourcesService: ResourcesService,
    private sideMenuService: SideMenuService,
    private sideMenuItemService: SideMenuItemService
  ) { }

  resource: Resource;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const resourceId = params['resourceId'];

      this.resourcesService.getResourceById(resourceId).subscribe(resource => {
        this.resource = resource;

        this.facilityService.getFacilityById(resource.facilityId).subscribe(facility => {
          const facilityItem = this.sideMenuItemService.parseFacility(facility);
          const resourceItem = this.sideMenuItemService.parseResource(resource);

          this.sideMenuService.setFacilityMenuItems([facilityItem, resourceItem]);
        });
      });
    });
  }
}
