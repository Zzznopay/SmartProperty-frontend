import {
  ArrowLeftOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  ProDescriptions,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { App, Avatar, Card, Skeleton, Tag, Typography } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { changePassword } from '@/services/smart-property/auth';

const useStyles = createStyles(({ token }) => ({
  page: {
    minHeight: '100vh',
    background: token.colorBgLayout,
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    background: token.colorBgContainer,
    borderBottom: `1px solid ${token.colorSplit}`,
    padding: '0 24px',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  container: {
    width: '100%',
    maxWidth: 960,
    margin: '0 auto',
    padding: '24px 24px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    flex: 1,
  },
  hero: {
    borderRadius: token.borderRadiusLG,
    overflow: 'hidden',
  },
  heroBody: {
    background:
      'linear-gradient(120deg, rgba(22,119,255,0.10), rgba(22,119,255,0.02))',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    padding: '28px 8px',
    flexWrap: 'wrap' as const,
  },
  roleTag: {
    marginInlineEnd: 0,
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
  },
  footerHint: {
    textAlign: 'center' as const,
    color: token.colorTextTertiary,
    fontSize: 12,
  },
}));

/** 常见角色 key → 展示名（与种子数据 sys_role 一致） */
const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: '系统管理员', color: 'gold' },
  property_manager: { label: '物业经理', color: 'blue' },
  finance_officer: { label: '财务专员', color: 'green' },
  customer_service: { label: '客服专员', color: 'cyan' },
  maintenance_engineer: { label: '维修工程师', color: 'orange' },
  security_squad: { label: '秩序班长', color: 'purple' },
};

const roleName = (key: string) => ROLE_LABELS[key]?.label ?? key;
const roleColor = (key: string) => ROLE_LABELS[key]?.color ?? 'blue';

const PasswordForm: React.FC = () => {
  const { message } = App.useApp();

  return (
    <ProForm<{
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    }>
      layout="vertical"
      requiredMark={false}
      style={{ maxWidth: 420 }}
      onFinish={async (values) => {
        try {
          await changePassword(values.oldPassword, values.newPassword);
          message.success('密码修改成功，下次登录请使用新密码');
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText.Password
        name="oldPassword"
        label="当前密码"
        placeholder="请输入当前登录密码"
        rules={[{ required: true, message: '请输入当前密码' }]}
        fieldProps={{ autoComplete: 'current-password' }}
      />
      <ProFormText.Password
        name="newPassword"
        label="新密码"
        placeholder="不少于 6 位，建议字母 + 数字组合"
        rules={[
          { required: true, message: '请输入新密码' },
          { min: 6, message: '新密码至少 6 位' },
        ]}
        fieldProps={{ autoComplete: 'new-password' }}
      />
      <ProFormText.Password
        name="confirmPassword"
        label="确认新密码"
        placeholder="请再次输入新密码"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: '请再次输入新密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          }),
        ]}
        fieldProps={{ autoComplete: 'new-password' }}
      />
    </ProForm>
  );
};

const AccountSettings: React.FC = () => {
  const { styles } = useStyles();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  const displayName = currentUser?.realName || currentUser?.username || '用户';
  const roles = currentUser?.roles ?? [];

  const goBack = () => {
    if (window.history.length > 1) {
      history.back();
    } else {
      history.push('/welcome');
    }
  };

  if (!currentUser) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Card>
            <Skeleton active avatar paragraph={{ rows: 4 }} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Typography.Link onClick={goBack} style={{ fontSize: 14 }}>
          <ArrowLeftOutlined /> 返回
        </Typography.Link>
        <Typography.Text strong style={{ fontSize: 15 }}>
          个人中心
        </Typography.Text>
      </div>

      <div className={styles.container}>
        <Card className={styles.hero} styles={{ body: { padding: 0 } }}>
          <div className={styles.heroBody}>
            {currentUser?.avatar ? (
              <Avatar size={72} src={currentUser.avatar} />
            ) : (
              <Avatar
                size={72}
                icon={<UserOutlined />}
                style={{ flexShrink: 0 }}
              />
            )}
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {displayName}
              </Typography.Title>
              <Typography.Text type="secondary">
                @{currentUser?.username ?? '-'}
              </Typography.Text>
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                {roles.length > 0 ? (
                  roles.map((r) => (
                    <Tag
                      key={r}
                      color={roleColor(r)}
                      className={styles.roleTag}
                    >
                      {roleName(r)}
                    </Tag>
                  ))
                ) : (
                  <Tag>暂无角色</Tag>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card
          title={
            <span className={styles.cardTitle}>
              <UserOutlined /> 基本信息
            </span>
          }
        >
          <ProDescriptions
            column={{ xs: 1, sm: 2 }}
            size="middle"
            dataSource={currentUser}
            columns={[
              { title: '用户名', dataIndex: 'username' },
              { title: '姓名', dataIndex: 'realName' },
              {
                title: '角色',
                dataIndex: 'roles',
                render: (_, entity) =>
                  ((entity as { roles?: string[] })?.roles ?? [])
                    .map((r) => roleName(r))
                    .join('、') || '-',
              },
              { title: '用户 ID', dataIndex: 'id' },
            ]}
          />
        </Card>

        <Card
          title={
            <span className={styles.cardTitle}>
              <SafetyCertificateOutlined /> 修改密码
            </span>
          }
        >
          <PasswordForm />
        </Card>

        <div className={styles.footerHint}>
          <LockOutlined />{' '}
          账号信息由系统统一管理，如需修改姓名或角色请联系管理员
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
