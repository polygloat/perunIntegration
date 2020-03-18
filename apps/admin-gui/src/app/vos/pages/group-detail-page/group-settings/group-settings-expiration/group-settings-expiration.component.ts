import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from 'ngx-polygloat';
import {NotificatorService} from '../../../../../core/services/common/notificator.service';
import { Urns } from '@perun-web-apps/perun/urns';
import { ApiRequestConfigurationService } from '../../../../../core/services/api/api-request-configuration.service';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';


@Component({
  selector: 'app-group-settings-expiration',
  templateUrl: './group-settings-expiration.component.html',
  styleUrls: ['./group-settings-expiration.component.scss']
})
export class GroupSettingsExpirationComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private attributesManager: AttributesManagerService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private apiRequest: ApiRequestConfigurationService
  ) {
    this.translate.get('GROUP_DETAIL.SETTINGS.EXPIRATION.SUCCESS_MESSAGE').subscribe(value => this.successMessage = value);
    this.translate.get('GROUP_DETAIL.SETTINGS.EXPIRATION.ERROR_MESSAGE').subscribe(value => this.errorMessage = value);
  }

  expirationAttribute: Attribute;

  successMessage: string;
  errorMessage: string;

  groupId: number;

  ngOnInit() {
    this.route.parent.parent.params.subscribe(params => {
      this.groupId = params['groupId'];

      this.loadSettings();
    });
  }

  private loadSettings(): void {
    this.attributesManager.getGroupAttributeByName(this.groupId, Urns.GROUP_DEF_EXPIRATION_RULES).subscribe(attr => {
      this.expirationAttribute = attr;
    });
  }

  saveExpirationAttribute(attribute: Attribute) {
    // FIXME this might not work in case of some race condition (other request finishes sooner)
    this.apiRequest.dontHandleErrorForNext();

    this.attributesManager.setGroupAttribute({group: this.groupId, attribute: attribute}).subscribe( () => {
        this.loadSettings();
        this.notificator.showSuccess(this.successMessage);
      },
      error => this.notificator.showRPCError(error.error, this.errorMessage));
  }
}
