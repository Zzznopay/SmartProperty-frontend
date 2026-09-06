import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  deleteUser,
  listUsers,
  type SysUser,
} from '@/services/smart-property/system/user';
import CreateForm from './components/CreateForm';
import ResetPwdForm from './components/ResetPwdForm';

const UserList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const statusMap = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );

  const cols: ProColumns<SysUser>[] = [
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '姓名', dataIndex: 'realName', width: 120 },
    { title: '部门', dataIndex: 'deptName', width: 140, search: false },
    {
      title: '手机',
      dataIndex: 'phoneMask',
      width: 140,
      search: false,
    },
    { title: '邮箱', dataIndex: 'email', width: 180, search: false },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      valueEnum: statusMap,
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
      width: 220,
      render: (_, record) => [
        <CreateForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <ResetPwdForm
          key="reset"
          trigger={<a>重置密码</a>}
          userId={record.id!}
          username={record.username}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该用户？"
          onConfirm={async () => {
            try {
              await deleteUser(record.id!);
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
      <ProTable<SysUser>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listUsers({
            current: params.current,
            pageSize: params.pageSize,
            username: params.username,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 80 }}
        toolBarRender={() => [
          <CreateForm
            key="create"
            trigger={<Button type="primary">新建用户</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default UserList;
