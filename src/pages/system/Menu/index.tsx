import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { useDict } from '@/hooks/useDict';
import {
  deleteMenu,
  getMenuTree,
  type SysMenu,
} from '@/services/smart-property/system/menu';
import CreateForm from './components/CreateForm';

const MenuList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const statusMap = useDict('sys_normal_disable');

  const cols: ProColumns<SysMenu>[] = [
    { title: '菜单名称', dataIndex: 'menuName', width: 200 },
    { title: '图标', dataIndex: 'icon', width: 120, search: false },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      search: false,
      valueType: 'digit',
    },
    { title: '权限标识', dataIndex: 'perms', width: 160, search: false },
    {
      title: '菜单类型',
      dataIndex: 'menuType',
      width: 100,
      valueEnum: {
        M: { text: '目录' },
        C: { text: '菜单' },
        F: { text: '按钮' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueEnum: statusMap,
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
        <CreateForm
          key="add-child"
          trigger={<a>新增下级</a>}
          values={{ parentId: record.id, menuType: 'C' } as SysMenu}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该菜单？"
          onConfirm={async () => {
            try {
              await deleteMenu(record.id!);
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
      <ProTable<SysMenu>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        pagination={false}
        expandable={{ defaultExpandAllRows: true }}
        request={async () => {
          const resp = (await getMenuTree()) as { data?: SysMenu[] };
          const data =
            (resp as unknown as { data?: SysMenu[] }).data ?? resp ?? [];
          const list = Array.isArray(data) ? data : [];
          return { data: list as never, success: true };
        }}
        search={false}
        toolBarRender={() => [
          <CreateForm
            key="create"
            trigger={<Button type="primary">新建菜单</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default MenuList;
