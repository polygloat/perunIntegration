import { Injectable } from '@angular/core';
import { TranslateService } from 'ngx-polygloat';
import { EntityMenuLink, SideMenuItem } from './side-menu.component';
import { AuthResolverService } from '../../core/services/common/auth-resolver.service';
import { Facility, Group, Resource, RichMember, User, Vo } from '@perun-web-apps/perun/openapi';
import { parseFullName } from '@perun-web-apps/perun/utils';
import { StoreService } from '../../core/services/common/store.service';

@Injectable({
  providedIn: 'root'
})
export class SideMenuItemService {

  constructor(
    private translate: TranslateService,
    private authResolver: AuthResolverService,
    private store: StoreService,
  ) {
  }

  baseItemColor = this.store.get('theme', 'sidemenu_bg_color');
  voBgColor = this.store.get('theme', 'sidemenu_vo_bg_color');
  memberBgColor = this.store.get('theme', 'sidemenu_member_bg_color');
  groupBgColor = this.store.get('theme', 'sidemenu_group_bg_color');
  facilityBgColor = this.store.get('theme', 'sidemenu_facility_bg_color');
  resourceBgColor = this.store.get('theme', 'sidemenu_resource_bg_color');
  userBgColor = this.store.get('theme', 'sidemenu_user_bg_color');

  baseItemTextColor = this.store.get('theme', 'sidemenu_text_color');
  voTextColor = this.store.get('theme', 'sidemenu_vo_text_color');
  memberTextColor = this.store.get('theme', 'sidemenu_member_text_color');
  groupTextColor = this.store.get('theme', 'sidemenu_group_text_color');
  facilityTextColor = this.store.get('theme', 'sidemenu_facility_text_color');
  resourceTextColor = this.store.get('theme', 'sidemenu_resource_text_color');
  userTextColor = this.store.get('theme', 'sidemenu_user_text_color');

  getFacilitiesManagementItem(): SideMenuItem {
    return {
      label: 'MAIN_MENU.FACILITIES',
      colorClass: 'base-item-color-activated',
      icon: 'perun-manage-facility',
      baseLink: ['/facilities'],
      links: [],
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^/facilities$',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor
    };
  }

  getAccessManagementItem(): SideMenuItem {
    return {
      label: 'MAIN_MENU.ACCESS',
      colorClass: 'base-item-color-activated',
      icon: 'perun-vo',
      links: [],
      baseLink: ['/organizations'],
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^/organizations$',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor
    };
  }

  getUserItem(user: User): SideMenuItem {
    return {
      baseLink: ['/profile'],
      expandable: false,
      label: 'MAIN_MENU.PROFILE',
      colorClass: 'base-item-color-activated',
      icon: 'perun-user',
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^dont-use$',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor,
      links: [
        {
          label: 'MENU_ITEMS.USER.OVERVIEW',
          url: ['/profile'],
          activatedRegex: '^/profile$'
        },
        {
          label: 'MENU_ITEMS.USER.DETAIL',
          url: ['/profile/detail'],
          activatedRegex: `^/profile/detail`
        },
        {
          label: 'MENU_ITEMS.USER.ORGANIZATIONS',
          url: [`/profile/organizations`],
          activatedRegex: `^/profile/organizations`
        },
        {
          label: 'MENU_ITEMS.USER.GROUPS',
          url: [`/profile/groups`],
          activatedRegex: `^/profile/groups`
        },
        {
          label: 'MENU_ITEMS.USER.SETTINGS',
          url: [`/profile/settings`],
          activatedRegex: `^/profile/settings$`,
          children: [
            {
              label: 'MENU_ITEMS.MEMBER.ATTRIBUTES',
              url: [`/profile/settings/attributes`],
              activatedRegex: `^/profile/settings/attributes`
            }
          ],
          showChildrenRegex: `^/profile/settings`
        },
      ],
    };
  }

  getAdminItem(): SideMenuItem {
    return {
      baseLink: ['/admin'],
      expandable: false,
      label: 'MAIN_MENU.ADMIN',
      colorClass: 'base-item-color-activated',
      icon: 'perun-perun-admin',
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^/dont-use$',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor,
      links: [
        {
          label: 'MENU_ITEMS.ADMIN.OVERVIEW',
          url: ['/admin'],
          activatedRegex: '^/admin$'
        },
        {
          label: 'MENU_ITEMS.ADMIN.ATTRIBUTES',
          url: ['/admin/attributes'],
          activatedRegex: '^/admin/attributes$'
        },
        {
          label: 'MENU_ITEMS.ADMIN.USERS',
          url: ['/admin/users'],
          activatedRegex: '^/admin/users$'
        },
        {
          label: 'MENU_ITEMS.ADMIN.VISUALIZER',
          url: ['/admin/visualizer'],
          activatedRegex: '^/admin/visualizer$',
          children: [
            {
              label: 'MENU_ITEMS.VISUALIZER.ATTR_DEPENDENCIES',
              url: ['/admin/visualizer/attrDependencies'],
              activatedRegex: '^/admin/visualizer/attrDependencies'
            },
            {
              label: this.translate.instant('MENU_ITEMS.VISUALIZER.USER_DESTINATION'),
              url: ['/admin/visualizer/userDestinationRelationship'],
              activatedRegex: '^/admin/visualizer/userDestinationRelationship'
            }
          ],
          showChildrenRegex: '/admin/visualizer'
        },
        {
          label: 'MENU_ITEMS.ADMIN.EXT_SOURCES',
          url: ['/admin/ext_sources'],
          activatedRegex: '^/admin/ext_sources$'
        }
      ]
    };
  }

  parseFacility(facility: Facility): SideMenuItem {
    return {
      label: facility.name,
      baseLink: [`/facilities/${facility.id}`],
      backgroundColorCss: this.facilityBgColor,
      textColorCss: this.facilityTextColor,
      links: [
        {
          label: 'MENU_ITEMS.FACILITY.OVERVIEW',
          url: [`/facilities/${facility.id}`],
          activatedRegex: '/facilities/\\d+$'
        },
        {
          label: 'MENU_ITEMS.FACILITY.RESOURCES',
          url: [`/facilities/${facility.id}/resources`],
          activatedRegex: '/facilities/\\d+/resources$'
        },
        {
          label: 'MENU_ITEMS.FACILITY.ALLOWED_GROUPS',
          url: [`/facilities/${facility.id}/allowed-groups`],
          activatedRegex: '/facilities/\\d+/allowed-groups'
        },
        {
          label: 'MENU_ITEMS.FACILITY.SETTINGS',
          url: ['/facilities', facility.id, 'settings'],
          activatedRegex: '/facilities/\\d+/settings$',
          children: [
            {
              label: 'MENU_ITEMS.FACILITY.ATTRIBUTES',
              url: ['/facilities', facility.id, 'settings', 'attributes'],
              activatedRegex: '/facilities/\\d+/settings/attributes$'
            }
          ],
          showChildrenRegex: '/facilities/\\d+/settings'
        }
      ],
      colorClass: 'facility-item',
      icon: 'perun-manage-facility',
      // labelClass: 'facility-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links'
    };
  }

  parseResource(resource: Resource): SideMenuItem {
    return {
      label: resource.name,
      baseLink: ['/facilities', resource.facilityId, 'resources', resource.id],
      backgroundColorCss: this.resourceBgColor,
      textColorCss: this.resourceTextColor,
      links: [
        {
          label: 'MENU_ITEMS.RESOURCE.OVERVIEW',
          url: ['/facilities', resource.facilityId, 'resources', resource.id],
          activatedRegex: '/facilities/\\d+/resources/\\d+$'
        },
        {
          label: 'MENU_ITEMS.RESOURCE.ASSIGNED_GROUPS',
          url: [`/facilities/${resource.facilityId}/resources/${resource.id}/groups`],
          activatedRegex: '/facilities/\\d+/resources/\\d+/groups$'
        },
        {
          label: 'MENU_ITEMS.RESOURCE.SETTINGS',
          url: [`/facilities/${resource.facilityId}/resources/${resource.id}/settings`],
          activatedRegex: '/facilities/\\d+/resources/\\d+/settings$',
          children: [
            {
              label: 'MENU_ITEMS.RESOURCE.ATTRIBUTES',
              url: [`/facilities/${resource.facilityId}/resources/${resource.id}/settings/attributes`],
              activatedRegex: '/facilities/\\d+/resources/\\d+/settings/attributes$'
            }
          ],
          showChildrenRegex: '/facilities/\\d+/resources/\\d+/settings'
        }
      ],
      colorClass: 'resource-item',
      icon: 'perun-manage-facility',
      // labelClass: 'resource-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
    };
  }

  parseGroup(group: Group): SideMenuItem {
    return {
      label: group.name,
      baseLink: [`/organizations/${group.voId}/groups/${group.id}`],
      backgroundColorCss: this.groupBgColor,
      textColorCss: this.groupTextColor,
      links: [
        {
          label: 'MENU_ITEMS.GROUP.OVERVIEW',
          url: [`/organizations/${group.voId}/groups/${group.id}`],
          activatedRegex: '/organizations/\\d+/groups/\\d+$'
        },
        {
          label: 'MENU_ITEMS.GROUP.MEMBERS',
          url: [`/organizations/${group.voId}/groups/${group.id}/members`],
          activatedRegex: '/organizations/\\d+/groups/\\d+/members$'
        },
        {
          label: 'MENU_ITEMS.GROUP.SUBGROUPS',
          url: [`/organizations/${group.voId}/groups/${group.id}/subgroups`],
          activatedRegex: '/organizations/\\d+/groups/\\d+/subgroups$'
        },
        {
          label: 'MENU_ITEMS.GROUP.RESOURCES',
          url: [`/organizations/${group.voId}/groups/${group.id}/resources`],
          activatedRegex: '/organizations/\\d+/groups/\\d+/resources$'
        },
        {
          label: 'MENU_ITEMS.GROUP.APPLICATIONS',
          url: [`/organizations/${group.voId}/groups/${group.id}/applications`],
          activatedRegex: '/organizations/\\d+/groups/\\d+/applications$'
        },
        {
          label: 'MENU_ITEMS.GROUP.SETTINGS',
          url: [`/organizations/${group.voId}/groups/${group.id}/settings`],
          activatedRegex: '/organizations/\\d+/groups/\\d+/settings$',
          children: [
            {
              label: 'MENU_ITEMS.GROUP.ATTRIBUTES',
              url: [`/organizations/${group.voId}/groups/${group.id}/settings/attributes`],
              activatedRegex: '/organizations/\\d+/groups/\\d+/settings/attributes$'
            },
            {
              label: 'MENU_ITEMS.GROUP.EXPIRATION',
              url: [`/organizations/${group.voId}/groups/${group.id}/settings/expiration`],
              activatedRegex: '/organizations/\\d+/groups/\\d+/settings/expiration$'
            },
            {
              label: 'MENU_ITEMS.GROUP.MANAGERS',
              url: [`/organizations/${group.voId}/groups/${group.id}/settings/managers`],
              activatedRegex: '/organizations/\\d+/groups/\\d+/settings/managers$'
            },
            {
              label: 'MENU_ITEMS.GROUP.APPLICATION_FORM',
              url: [`/organizations/${group.voId}/groups/${group.id}/settings/applicationForm`],
              activatedRegex: '/organizations/\\d+/groups/\\d+/settings/applicationForm$'
            },
            {
              label: 'MENU_ITEMS.GROUP.NOTIFICATIONS',
              url: [`/organizations/${group.voId}/groups/${group.id}/settings/notifications`],
              activatedRegex: '/organizations/\\d+/groups/\\d+/settings/notifications$'
            },
            {
              label: 'MENU_ITEMS.GROUP.RELATIONS',
              url: [`/organizations/${group.voId}/groups/${group.id}/settings/relations`],
              activatedRegex: '/organizations/\\d+/groups/\\d+/settings/relations$'
            }
          ],
          showChildrenRegex: '/organizations/\\d+/groups/\\d+/settings'
        }
      ],
      colorClass: 'group-item',
      icon: 'perun-group',
      // labelClass: 'group-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links'
    };
  }

  parseVo(vo: Vo): SideMenuItem {
    return {
      label: vo.name,
      baseLink: [`/organizations/${vo.id}`],
      links: this.getVoLinks(vo),
      colorClass: 'vo-item',
      icon: 'perun-vo',
      // labelClass: 'vo-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
      backgroundColorCss: this.voBgColor,
      textColorCss: this.voTextColor,
    };
  }

  parseMember(member: RichMember): SideMenuItem {
    return {
      label: parseFullName(member.user),
      baseLink: [`/organizations/${member.voId}/members/${member.id}`],
      backgroundColorCss: this.memberBgColor,
      textColorCss: this.memberTextColor,
      links: [
        {
          label: 'MENU_ITEMS.MEMBER.OVERVIEW',
          url: [`/organizations/${member.voId}/members/${member.id}`],
          activatedRegex: '/organizations/\\d+/members/\\d+$'
        },
        {
          label: 'MENU_ITEMS.MEMBER.GROUPS',
          url: [`//organizations/${member.voId}/members/${member.id}/groups`],
          activatedRegex: '/organizations/\\d+/members/\\d+/groups'
        },
        {
          label: 'MENU_ITEMS.MEMBER.SETTINGS',
          url: [`/organizations/${member.voId}/members/${member.id}/settings`],
          activatedRegex: '/organizations/\\d+/members/\\d+/settings$',
          children: [
            {
              label: 'MENU_ITEMS.MEMBER.ATTRIBUTES',
              url: [`/organizations/${member.voId}/members/${member.id}/settings/attributes`],
              activatedRegex: '/organizations/\\d+/members/\\d+/settings/attributes$'
            }
          ],
          showChildrenRegex: '/organizations/\\d+/members/\\d+/settings'
        }
      ],
      colorClass: 'member-item',
      icon: 'perun-user',
      // labelClass: 'member-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links'
    };
  }

  parseUser(user: User, path: string, regex: string): SideMenuItem {
    return {
      label: parseFullName(user),
      baseLink: [path],
      backgroundColorCss: this.userBgColor,
      textColorCss: this.userTextColor,
      links: [
        {
          label: 'MENU_ITEMS.USER.OVERVIEW',
          url: [path],
          activatedRegex: `${regex}$`
        },
        {
          label: 'MENU_ITEMS.USER.DETAIL',
          url: [`${path}/detail`],
          activatedRegex: `${regex}/detail`
        },
        {
          label: 'MENU_ITEMS.USER.ORGANIZATIONS',
          url: [`${path}/organizations`],
          activatedRegex: `${regex}/organizations`
        },
        {
          label: 'MENU_ITEMS.USER.GROUPS',
          url: [`${path}/groups`],
          activatedRegex: `${regex}/groups`
        },
        {
          label: 'MENU_ITEMS.USER.SETTINGS',
          url: [`${path}/settings`],
          activatedRegex: `${regex}/settings$`,
          children: [
            {
              label: 'MENU_ITEMS.MEMBER.ATTRIBUTES',
              url: [`${path}/settings/attributes`],
              activatedRegex: `${regex}/settings/attributes`
            }
          ],
          showChildrenRegex: `${regex}/settings`
        },
      ],
      colorClass: 'user-bg-color',
      icon: 'perun-user',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links'
    };
  }

  getVoLinks(vo: Vo): EntityMenuLink[] {
    const links: EntityMenuLink[] = [];

    // Overview
    links.push({
      label: 'MENU_ITEMS.VO.OVERVIEW',
      url: [`/organizations/${vo.id}`],
      activatedRegex: '/organizations/\\d+$'
    });

    // Members
    if (this.authResolver.isThisVoAdminOrObserver(vo.id)) {
      links.push({
        label: 'MENU_ITEMS.VO.MEMBERS',
        url: [`/organizations/${vo.id}/members`],
        activatedRegex: '/organizations/\\d+/members$'
      });
    }

    // Groups
    if (this.authResolver.isThisVoAdminOrObserver(vo.id)
      || this.authResolver.isGroupAdminInThisVo(vo.id)) {
      links.push({
        label: 'MENU_ITEMS.VO.GROUPS',
        url: [`/organizations/${vo.id}/groups`],
        activatedRegex: '/organizations/\\d+/groups$'
      });
    }

    // Resource management
    if (this.authResolver.isThisVoAdminOrObserver(vo.id)) {
      links.push({
        label: 'MENU_ITEMS.VO.RESOURCES',
        url: [`/organizations/${vo.id}/resources`],
        activatedRegex: '/organizations/\\d+/resources$',
        children: [
          {
            label: 'MENU_ITEMS.VO.RESOURCE_PREVIEW',
            url: [`/organizations/${vo.id}/resources/preview`],
            activatedRegex: '/organizations/\\d+/resources/preview$'
          },
          {
            label: 'MENU_ITEMS.VO.RESOURCE_TAGS',
            url: [`/organizations/${vo.id}/resources/tags`],
            activatedRegex: '/organizations/\\d+/resources/tags$'
          },
          {
            label: 'MENU_ITEMS.VO.RESOURCE_STATES',
            url: [`/organizations/${vo.id}/resources/states`],
            activatedRegex: '/organizations/\\d+/resources/states$'
          }
        ],
        showChildrenRegex: '/organizations/\\d+/resources'
      });
    }

    // Applications
    if (this.authResolver.isThisVoAdminOrObserver(vo.id)) {
      links.push({
        label: 'MENU_ITEMS.VO.APPLICATIONS',
        url: [`/organizations/${vo.id}/applications`],
        activatedRegex: '/organizations/\\d+/applications'
      });
    }

    // Settings
    if (this.authResolver.isThisVoAdminOrObserver(vo.id)) {
      links.push({
        label: 'MENU_ITEMS.VO.SETTINGS',
        url: [`/organizations/${vo.id}/settings`],
        activatedRegex: '/organizations/\\d+/settings$',
        children: [
          {
            label: 'MENU_ITEMS.VO.ATTRIBUTES',
            url: [`/organizations/${vo.id}/settings/attributes`],
            activatedRegex: '/organizations/\\d+/settings/attributes$'
          },
          {
            label: 'MENU_ITEMS.VO.EXPIRATION',
            url: [`/organizations/${vo.id}/settings/expiration`],
            activatedRegex: '/organizations/\\d+/settings/expiration$'
          },
          {
            label: 'MENU_ITEMS.VO.MANAGERS',
            url: [`/organizations/${vo.id}/settings/managers`],
            activatedRegex: '/organizations/\\d+/settings/managers$'
          },
          {
            label: 'MENU_ITEMS.VO.APPLICATION_FORM',
            url: [`/organizations/${vo.id}/settings/applicationForm`],
            activatedRegex: '/organizations/\\d+/settings/applicationForm$'
          },
          {
            label: 'MENU_ITEMS.VO.NOTIFICATIONS',
            url: [`/organizations/${vo.id}/settings/notifications`],
            activatedRegex: '/organizations/\\d+/settings/notifications$'
          },
          {
            label: 'MENU_ITEMS.VO.EXTSOURCES',
            url: [`/organizations/${vo.id}/settings/extsources`],
            activatedRegex: '/organizations/\\d+/settings/extsources$'
          }
        ],
        showChildrenRegex: '/organizations/\\d+/settings'
      });
    }

    return links;
  }
}
