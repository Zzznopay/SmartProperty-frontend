// smart-property 全局类型声明
import type { CurrentUser, LoginParams, LoginResult, MenuNode, CaptchaResult } from './auth';

declare global {
  // 后续按业务模块扩展
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace SP {
    type CurrentUser = import('./auth').CurrentUser;
    type LoginParams = import('./auth').LoginParams;
    type LoginResult = import('./auth').LoginResult;
    type MenuNode = import('./auth').MenuNode;
    type CaptchaResult = import('./auth').CaptchaResult;
  }
}

export type { CurrentUser, LoginParams, LoginResult, MenuNode, CaptchaResult };
