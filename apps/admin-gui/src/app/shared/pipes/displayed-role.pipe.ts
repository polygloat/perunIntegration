import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from 'ngx-polygloat';

@Pipe({
  name: 'displayedRole'
})
export class DisplayedRolePipe implements PipeTransform {

  constructor(
    private translate: TranslateService
  ) {}

  prefix = 'ROLES.';

  transform(value: any, args?: any): any {
    const data = this.prefix.concat(value);
    return this.translate.instant(data);
  }

}
