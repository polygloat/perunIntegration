import { EventEmitter, Injectable, Output } from '@angular/core';
import { NotificationData } from '../../../shared/models/NotificationData';
import { TranslateService } from 'ngx-polygloat';
import { RPCError } from '@perun-web-apps/perun/models';

@Injectable({
  providedIn: 'root'
})
export class NotificatorService {

  constructor(
    private translate: TranslateService
  ) {
  }

  defaultAction: string;
  defaultRpcMessage: string;

  defaultErrorDelayMs = 5_000;
  defaultSuccessDelayMs = 3_000;

  @Output()
  addNotification: EventEmitter<NotificationData> = new EventEmitter<NotificationData>();

  getDefaultActionMessage(): string {
    if (this.defaultAction === undefined) {
      return this.defaultAction = this.translate.instant('NOTIFICATOR.NOTIFICATION.DEFAULT_ACTION');
    } else {
      return this.defaultAction;
    }
  }

  getDefaultRpcMessage(): string {
    if (this.defaultRpcMessage === undefined) {
      return this.defaultRpcMessage = this.translate.instant('NOTIFICATOR.NOTIFICATION.DEFAULT_RPC_ERROR_MESSAGE');
    } else {
      return this.defaultRpcMessage;
    }
  }

  /**
   * Shows default RPC error
   *
   * @param rpcError - error returned by the backend
   * @param errorMessage - custom message that will be displayed
   */
  showRPCError(rpcError: RPCError, errorMessage = this.getDefaultRpcMessage()): void {
    this.showError(errorMessage + '\n' + rpcError.name, rpcError, rpcError.message);
  }

  /**
   * Shows error notification
   *
   * @param title - text that is shown on the notification
   * @param error - RPC error
   * @param description - text shown in the body of dialog which is displayed after clicking the action
   * @param actionText - clickable text shown on the notification which starts specified or default action
   * @param action - action which will be executed after clicking the actionText
   */
  showError(title: string, error?: RPCError, description?: string, actionText?: string, action?: () => void): void {
    this.addNotification.emit({
      type: 'error',
      error: error,
      description: description,
      title: title,
      actionText: actionText === undefined && description !== undefined ? this.getDefaultActionMessage() : actionText,
      delay: this.defaultErrorDelayMs,
      icon: 'error_outline',
      action: action,
      timeStamp: `${new Date().getHours()}:${new Date().getMinutes()}`
    });
  }

  /**
   * Shows success notification
   *
   * @param title - text that is shown on the notification
   * @param description - text shown in the body of dialog which is displayed after clicking the action
   * @param actionText - clickable text shown on the notification which starts specified or default action
   * @param action - action which will be executed after clicking the actionText
   */
  showSuccess(title: string, description?: string, actionText?: string, action?: () => void): void {
    this.addNotification.emit({
      type: 'success',
      description: description,
      title: title,
      actionText: actionText === undefined && description !== undefined ? this.getDefaultActionMessage() : actionText,
      delay: this.defaultSuccessDelayMs,
      icon: 'done',
      action: action,
      timeStamp: `${new Date().getHours()}:${new Date().getMinutes()}`
    });
  }
}
