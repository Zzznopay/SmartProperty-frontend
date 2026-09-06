import { ModalForm, ProFormText } from '@ant-design/pro-components';
import React from 'react';
import { resetPassword } from '@/services/smart-property/system/user';

type Props = {
  trigger: React.ReactNode;
  userId: number;
  username?: string;
  reload?: () => void;
};

const ResetPwdForm: React.FC<Props> = ({
  trigger,
  userId,
  username,
  reload,
}) => (
  <ModalForm
    title={`重置密码 - ${username ?? ''}`}
    trigger={trigger as React.ReactElement<unknown>}
    onFinish={async (vals) => {
      try {
        await resetPassword(userId, vals.newPassword);
        reload?.();
        return true;
      } catch {
        return false;
      }
    }}
  >
    <ProFormText.Password
      name="newPassword"
      label="新密码"
      rules={[{ required: true, min: 6 }]}
    />
    <ProFormText.Password
      name="confirm"
      label="确认密码"
      dependencies={['newPassword']}
      rules={[
        { required: true },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('newPassword') === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('两次密码不一致'));
          },
        }),
      ]}
    />
  </ModalForm>
);

export default ResetPwdForm;
