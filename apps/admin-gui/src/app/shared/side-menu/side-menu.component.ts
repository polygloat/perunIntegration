import {Component, HostListener, Input, OnInit} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {SideMenuService} from '../../core/services/common/side-menu.service';
import {AppComponent} from '../../app.component';
import {SideMenuItemService} from './side-menu-item.service';
import {AuthResolverService} from '../../core/services/common/auth-resolver.service';
import {rollInOut} from '../animations/Animations';
import {StoreService} from '../../core/services/common/store.service';
import {TranslateService} from "ngx-polygloat";

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  animations: [
    rollInOut
  ]
})
export class SideMenuComponent implements OnInit {

  constructor(
    private sideMenuService: SideMenuService,
    private sideMenuItemService: SideMenuItemService,
    public authResolver: AuthResolverService,
    private store: StoreService,
    private translateService: TranslateService
  ) {
  }

  accessItems: SideMenuItem[] = [];
  facilityItems: SideMenuItem[] = [];
  adminItems: SideMenuItem[] = [];
  userItems: SideMenuItem[] = [];

  accessItem = this.sideMenuItemService.getAccessManagementItem();
  adminItem = null;
  facilityItem = this.sideMenuItemService.getFacilitiesManagementItem();
  userItem = this.sideMenuItemService.getUserItem(this.store.getPerunPrincipal().user);

  @Input()
  sideNav: MatSidenav;

  mobileView = true;
  adminItemOpened = false;
  userItemOpened = false;
  backgroundColor = this.store.get('theme', 'sidemenu_bg_color');

  ngOnInit(): void {
    this.translateService.get("").subscribe(() => this.sideMenuItemService.getAdminItem());

    this.mobileView = window.innerWidth <= AppComponent.minWidth;
    if (this.mobileView) {
      this.sideNav.close();
    } else {
      this.sideNav.open();
    }

    this.sideMenuService.facilityItemsChange.subscribe(items => {
      this.setFacilityItems(items);
    });
    this.sideMenuService.accessItemsChange.subscribe(items => {
      this.setAccessItems(items);
    });
    this.sideMenuService.adminItemsChange.subscribe(items => {
      this.setAdminItems(items);
    });
    this.sideMenuService.userItemsChange.subscribe(items => {
      this.setUserItems(items);
    });
    this.sideMenuService.resetChange.subscribe(() => {
      this.reset();
    });
  }

  private reset(): void {
    this.adminItemOpened = false;
    this.userItemOpened = false;
    this.setNewItems(this.userItems, []);
    this.setNewItems(this.adminItems, []);
    this.setNewItems(this.accessItems, []);
    this.setNewItems(this.facilityItems, []);
  }

  private resetExceptFacility(): void {
    this.adminItemOpened = false;
    this.userItemOpened = false;
    this.setNewItems(this.userItems, []);
    this.setNewItems(this.adminItems, []);
    this.setNewItems(this.accessItems, []);
  }

  private resetExceptAccess(): void {
    this.adminItemOpened = false;
    this.userItemOpened = false;
    this.setNewItems(this.userItems, []);
    this.setNewItems(this.adminItems, []);
    this.setNewItems(this.facilityItems, []);
  }

  private resetExceptAdmin(): void {
    this.userItemOpened = false;
    this.setNewItems(this.userItems, []);
    this.setNewItems(this.accessItems, []);
    this.setNewItems(this.facilityItems, []);
  }

  private resetExceptUser(): void {
    this.adminItemOpened = false;
    this.setNewItems(this.accessItems, []);
    this.setNewItems(this.facilityItems, []);
    this.setNewItems(this.adminItems, []);
  }

  private setFacilityItems(items: SideMenuItem[]) {
    this.resetExceptFacility();
    this.setNewItems(this.facilityItems, items);
  }

  private setAccessItems(items: SideMenuItem[]) {
    this.resetExceptAccess();
    this.setNewItems(this.accessItems, items);
  }

  private setUserItems(items: SideMenuItem[]) {
    this.userItemOpened = true;
    this.resetExceptUser();
    this.setNewItems(this.userItems, items);
  }

  private setAdminItems(items: SideMenuItem[]) {
    this.adminItemOpened = true;
    this.resetExceptAdmin();
    this.setNewItems(this.adminItems, items);
  }

  /**
   * This method is used to set new sideMenuItems to an existing array of items.
   *
   * The method replaces only items that were not int the origin array.
   * If the new array has smaller size, excessive items are removed from the origin array.
   * This method is used because of animations. Without this, they do not work properly.
   *
   * @param originItems origin array
   * @param newItems new items
   */
  private setNewItems(originItems: SideMenuItem[], newItems: SideMenuItem[]) {
    const maxLength = originItems.length > newItems.length ? originItems.length : newItems.length;

    for (let i = 0; i < maxLength; i++) {
      if (i > originItems.length - 1) {
        originItems.push(newItems[i]);
      } else if (i > newItems.length - 1) {
        const originItemsLength = originItems.length;
        for (let j = 0; j < originItemsLength - i; j++) {
          originItems.pop();
        }
        break;
      } else if (!this.areSameItems(originItems[i], newItems[i])) {
        originItems[i] = newItems[i];
      }
      // items are same, dont switch
    }
  }

  private areSameItems(item1: SideMenuItem, item2: SideMenuItem) {
    return item1.label === item2.label && item1.labelClass === item2.labelClass;
  }
}

export interface SideMenuItem {
  label: string;
  labelClass?: string;
  colorClass: string;
  activatedClass?: string;
  links: EntityMenuLink[];
  icon: string;
  baseLink?: any[];
  expandable?: boolean;
  baseColorClass?: string;
  baseColorClassRegex?: string;
  linksClass?: string;
  backgroundColorCss?: string;
  textColorCss?: string;
}

export interface EntityMenuLink {
  label: string;
  url: any[] | string;
  activatedRegex: string;
  children?: EntityMenuLink[];
  showChildrenRegex?: string;
}
