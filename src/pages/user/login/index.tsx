import { LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormText,
} from '@ant-design/pro-components';
import {
  FormattedMessage,
  Helmet,
  SelectLang,
  useIntl,
  useModel,
} from '@umijs/max';
import { App, Button, Form, Input, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import { Footer } from '@/components';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/requestErrorConfig';
import {
  type CaptchaResult,
  getCaptcha,
  type LoginParams,
  login,
} from '@/services/smart-property/auth';
import Settings from '../../../../config/defaultSettings';

const getSafeRedirectUrl = (redirect: string | null): string => {
  if (!redirect?.startsWith('/')) return '/';
  if (redirect.startsWith('//')) return '/';
  try {
    const parsed = new URL(redirect, window.location.origin);
    if (parsed.origin !== window.location.origin) return '/';
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
};

const useStyles = createStyles(({ token }) => {
  return {
    captchaImg: {
      cursor: 'pointer',
      height: 40,
      width: 110,
      borderRadius: token.borderRadius,
      border: `1px solid ${token.colorBorder}`,
      marginLeft: 8,
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const Lang = () => {
  const { styles } = useStyles();
  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();
  const [captcha, setCaptcha] = useState<CaptchaResult | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const refreshCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const data = await getCaptcha();
      setCaptcha(data);
    } catch (err) {
      // 后端可能未启用图形验证码，留空让前端继续
      setCaptcha(null);
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      setInitialState((s) => ({ ...s, currentUser: userInfo }));
    }
  };

  const handleSubmit = async (values: LoginParams & { captcha?: string }) => {
    try {
      const params: LoginParams = {
        username: values.username,
        password: values.password,
        captchaCode: values.captcha,
        captchaKey: captcha?.captchaKey,
      };
      await login(params);
      message.success(
        intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        }),
      );
      await fetchUserInfo();
      const urlParams = new URL(window.location.href).searchParams;
      const redirectUrl = getSafeRedirectUrl(urlParams.get('redirect'));
      window.location.href = redirectUrl;
    } catch {
      refreshCaptcha();
      message.error(
        intl.formatMessage({
          id: 'pages.login.failure',
          defaultMessage: '登录失败，请重试！',
        }),
      );
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      <div style={{ flex: '1', padding: '32px 0' }}>
        <LoginForm
          contentStyle={{ minWidth: 280, maxWidth: '75vw' }}
          logo={<img alt="logo" src="/logo.svg" />}
          title={Settings.title ?? '智能物业管理系统'}
          subTitle={intl.formatMessage({
            id: 'pages.layouts.userLayout.title',
            defaultMessage: 'ZZZ · 物业服务管理平台',
          })}
          initialValues={{
            username: localStorage.getItem('sp_last_username') ?? 'admin',
          }}
          onFinish={async (values) => {
            localStorage.setItem('sp_last_username', values.username ?? '');
            await handleSubmit(values as LoginParams);
          }}
        >
          <Tabs
            activeKey="account"
            items={[
              {
                key: 'account',
                label: intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: '账户密码登录',
                }),
              },
            ]}
          />

          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.username.placeholder',
              defaultMessage: '请输入用户名',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.username.required"
                    defaultMessage="请输入用户名!"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: 'pages.login.password.placeholder',
              defaultMessage: '请输入密码',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="请输入密码!"
                  />
                ),
              },
            ]}
          />
          <Form.Item
            name="captcha"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.captcha.required"
                    defaultMessage="请输入验证码!"
                  />
                ),
              },
            ]}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Input
                size="large"
                prefix={<SafetyOutlined />}
                placeholder={intl.formatMessage({
                  id: 'pages.login.captcha.placeholder',
                  defaultMessage: '请输入验证码',
                })}
                style={{ flex: 1 }}
              />
              {captcha?.img ? (
                <img
                  src={
                    captcha.img.startsWith('data:')
                      ? captcha.img
                      : `data:image/png;base64,${captcha.img}`
                  }
                  className={styles.captchaImg}
                  onClick={refreshCaptcha}
                  alt="captcha"
                  style={{ opacity: captchaLoading ? 0.5 : 1 }}
                />
              ) : (
                <Button
                  onClick={refreshCaptcha}
                  loading={captchaLoading}
                  style={{ marginLeft: 8, height: 40 }}
                >
                  获取验证码
                </Button>
              )}
            </div>
          </Form.Item>
          {/*<div style={{ marginBottom: 24, marginTop: 12 }}>*/}
          {/*  <Button*/}
          {/*    type="link"*/}
          {/*    style={{ float: 'right', padding: 0 }}*/}
          {/*    onClick={() => {*/}
          {/*      message.info('请联系系统管理员重置密码');*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <FormattedMessage*/}
          {/*      id="pages.login.forgotPassword"*/}
          {/*      defaultMessage="忘记密码"*/}
          {/*    />*/}
          {/*  </Button>*/}
          {/*</div>*/}
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;

// 静默使用避免未引用告警
void ACCESS_TOKEN_KEY;
void REFRESH_TOKEN_KEY;
