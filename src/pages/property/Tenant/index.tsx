import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  addTenant,
  deleteTenant,
  listTenants,
  type Tenant as TenantType,
  updateTenant,
} from '@/services/smart-property/property/tenant';

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: TenantType;
};

const TenantForm: React.FC<FormProps> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const statusEnum = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );

  return (
    <ModalForm<TenantType>
      title={isEdit ? '编辑租户' : '新建租户'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateTenant(values.id, vals);
          } else {
            await addTenant(vals);
          }
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText
        name="tenantCode"
        label="租户编号"
        rules={[{ required: true, message: '请输入租户编号' }]}
      />
      <ProFormText
        name="tenantName"
        label="租户姓名"
        rules={[{ required: true, message: '请输入租户姓名' }]}
      />
      <ProFormText name="phone" label="手机号" />
      <ProFormRadio.Group
        name="gender"
        label="性别"
        options={[
          { label: '未知', value: 0 },
          { label: '男', value: 1 },
          { label: '女', value: 2 },
        ]}
      />
      <ProFormText name="idCard" label="身份证号" />
      <ProFormText name="email" label="邮箱" />
      <ProFormText name="companyName" label="所在单位" />
      <ProFormSelect
        name="status"
        label="状态"
        options={Object.entries(statusEnum).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const TenantList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();

  const statusEnum = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );
  const genderEnum = useDict('sys_user_sex', DICT_FALLBACKS.sys_user_sex);

  const cols: ProColumns<TenantType>[] = [
    { title: '租户编号', dataIndex: 'tenantCode', width: 130 },
    { title: '姓名', dataIndex: 'tenantName', width: 110 },
    {
      title: '手机',
      dataIndex: 'phoneMask',
      width: 140,
      search: false,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 80,
      valueEnum: genderEnum,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueEnum: statusEnum,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 170,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        <TenantForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该租户？"
          onConfirm={async () => {
            try {
              await deleteTenant(record.id!);
              message.success('删除成功');
              actionRef.current?.reload();
            } catch {
              message.error('删除失败');
            }
          }}
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<TenantType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listTenants({
            current: params.current,
            pageSize: params.pageSize,
            tenantCode: params.tenantCode,
            tenantName: params.tenantName,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <TenantForm
            key="create"
            trigger={<Button type="primary">新建租户</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default TenantList;
