import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';

dayjs.extend(relativeTime);

import {
  AvatarDropdown,
  ErrorBoundary,
  Footer,
  LangDropdown,
  OfflineBanner,
} from '@/components';
import { queryCurrentUser } from '@/services/smart-property/auth';
import defaultSettings from '../config/defaultSettings';
import {
  ACCESS_TOKEN_KEY,
  errorConfig,
  loginPath,
  REFRESH_TOKEN_KEY,
} from './requestErrorConfig';

const isDev = process.env.NODE_ENV === 'development';

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: SP.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<SP.CurrentUser | undefined>;
  settingDrawerOpen?: boolean;
}> {
  const fetchUserInfo = async () => {
    // 未登录直接放过（由路由守卫拦截）
    if (!localStorage.getItem(ACCESS_TOKEN_KEY)) return undefined;
    try {
      const resp = await queryCurrentUser({ skipErrorHandler: true });
      return resp?.data ?? (resp as unknown as SP.CurrentUser);
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      const loc = history.location as unknown as {
        pathname: string;
        search: string;
        hash: string;
      };
      const { pathname, search, hash } = loc;
      if (pathname !== loginPath) {
        history.replace(
          `${loginPath}?redirect=${encodeURIComponent(pathname + search + hash)}`,
        );
      }
      return undefined;
    }
  };

  const loc = history.location as unknown as { pathname: string };
  if (
    ![loginPath, '/user/register', '/user/register-result'].includes(
      loc.pathname,
    )
  ) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
      settingDrawerOpen: false,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
    settingDrawerOpen: false,
  };
}

export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}: {
  initialState: any;
  setInitialState: (updater: (s: any) => any) => void;
}) => {
  return {
    menuItemRender: (item: any, dom: any) => {
      if (item.path) {
        return (
          <Link to={item.path} prefetch>
            {dom}
          </Link>
        );
      }
      return dom;
    },
    actionsRender: () => {
      const localeEnabled =
        (initialState?.settings as { locale?: boolean })?.locale !== false;
      return [localeEnabled && <LangDropdown key="lang" />].filter(Boolean);
    },
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: initialState?.currentUser?.realName ?? '用户',
      render: (_: any, avatarChildren: React.ReactNode) => (
        <AvatarDropdown>{avatarChildren}</AvatarDropdown>
      ),
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const location = history.location as unknown as {
        pathname: string;
        search: string;
        hash: string;
      };
      if (
        !initialState?.currentUser &&
        ![loginPath, '/user/register', '/user/register-result'].includes(
          location.pathname,
        )
      ) {
        history.replace(
          `${loginPath}?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`,
        );
      }
    },
    bgLayoutImgList: [],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    ErrorBoundary,
    menuHeaderRender: undefined,
    childrenRender: (children: any) => {
      return (
        <>
          {children}
          <SettingDrawer
            disableUrlParams
            enableDarkTheme
            collapse={initialState?.settingDrawerOpen}
            onCollapseChange={(open) => {
              setInitialState((s: any) => ({
                ...s,
                settingDrawerOpen: open,
              }));
            }}
            settings={initialState?.settings}
            onSettingChange={(settings) => {
              setInitialState((s: any) => ({
                ...s,
                settings,
              }));
            }}
          />
        </>
      );
    },
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  ...errorConfig,
};

export function rootContainer(container: React.ReactNode) {
  return (
    <>
      <OfflineBanner />
      <ErrorBoundary>{container}</ErrorBoundary>
    </>
  );
}
