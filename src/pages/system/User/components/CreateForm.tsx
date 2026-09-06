import {
  ModalForm,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import React from 'react';
import {
  addUser,
  type SysUser,
  updateUser,
} from '@/services/smart-property/system/user';

type Props = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: SysUser;
};

const UserForm: React.FC<Props> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  return (
    <ModalForm<SysUser>
      title={isEdit ? '编辑用户' : '新建用户'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateUser(values.id, vals);
          } else {
            await addUser(vals);
          }
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText
        name="username"
        label="用户名"
        rules={[{ required: true }]}
      />
      {!isEdit && (
        <ProFormText.Password
          name="password"
          label="初始密码"
          rules={[{ required: true }]}
        />
      )}
      <ProFormText
        name="realName"
        label="真实姓名"
        rules={[{ required: true }]}
      />
      <ProFormText name="phone" label="手机号" />
      <ProFormText name="email" label="邮箱" />
      <ProFormRadio.Group
        name="gender"
        label="性别"
        options={[
          { label: '未知', value: 0 },
          { label: '男', value: 1 },
          { label: '女', value: 2 },
        ]}
      />
      <ProFormSelect
        name="status"
        label="状态"
        options={[
          { label: '禁用', value: 0 },
          { label: '启用', value: 1 },
        ]}
        initialValue={1}
      />
    </ModalForm>
  );
};

export default UserForm;
