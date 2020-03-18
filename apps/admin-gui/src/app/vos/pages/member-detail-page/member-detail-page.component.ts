import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {SideMenuItemService} from '../../../shared/side-menu/side-menu-item.service';
import {SideMenuService} from '../../../core/services/common/side-menu.service';
import {TranslateService} from 'ngx-polygloat';
import {fadeIn} from '../../../shared/animations/Animations';
import { MembersService, VoService } from '@perun-web-apps/perun/services';
import { RichMember, Vo } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-member-detail-page',
  templateUrl: './member-detail-page.component.html',
  styleUrls: ['./member-detail-page.component.scss'],
  animations: [
    fadeIn
  ]
})
export class MemberDetailPageComponent implements OnInit {

  constructor(
    private sideMenuItemService: SideMenuItemService,
    private translate: TranslateService,
    private sideMenuService: SideMenuService,
    private membersService: MembersService,
    private voService: VoService,
    private route: ActivatedRoute,
  ) { }

  vo: Vo;
  member: RichMember;

  fullName = '';

  ngOnInit() {
    this.route.params.subscribe(params => {
      const voId = params['voId'];
      const memberId = params['memberId'];

      this.voService.getVoById(voId).subscribe(vo => {
        this.vo = vo;
        this.membersService.getRichMemberWithAttributes(memberId).subscribe(member => {
          this.member = member;
          const voSideMenuItem = this.sideMenuItemService.parseVo(this.vo);
          const memberSideMenuItem = this.sideMenuItemService.parseMember(this.member);
          this.fullName = memberSideMenuItem.label;
          this.sideMenuService.setAccessMenuItems([voSideMenuItem, memberSideMenuItem]);
        });
      });
    });
  }
}
