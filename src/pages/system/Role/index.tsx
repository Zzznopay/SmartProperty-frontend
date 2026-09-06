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
  deleteRole,
  listRoles,
  type SysRole,
} from '@/services/smart-property/system/role';
import CreateForm from './components/CreateForm';

const RoleList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const statusMap = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );

  const cols: ProColumns<SysRole>[] = [
    { title: '角色ID', dataIndex: 'id', width: 100, search: false },
    { title: '角色名称', dataIndex: 'roleName', width: 160 },
    { title: '权限字符', dataIndex: 'roleKey', width: 160 },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      search: false,
      valueType: 'digit',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
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
      width: 200,
      render: (_, record) => [
        <CreateForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该角色？"
          onConfirm={async () => {
            try {
              await deleteRole(record.id!);
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
      <ProTable<SysRole>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = (await listRoles({
            current: params.current,
            pageSize: params.pageSize,
            roleName: params.roleName,
          })) as { data?: { records: SysRole[]; total: number } };
          const data = resp?.data ?? { records: [], total: 0 };
          return {
            data: data.records ?? [],
            total: data.total ?? 0,
            success: true,
          } as never;
        }}
        search={{ labelWidth: 80 }}
        toolBarRender={() => [
          <CreateForm
            key="create"
            trigger={<Button type="primary">新建角色</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default RoleList;
