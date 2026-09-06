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
  type Company,
  deleteCompany,
  listCompanys,
} from '@/services/smart-property/system/company';
import CreateForm from './components/CreateForm';

const CompanyList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const statusMap = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );

  const cols: ProColumns<Company>[] = [
    { title: '公司名称', dataIndex: 'companyName', width: 220 },
    { title: '公司编码', dataIndex: 'companyCode', width: 140 },
    { title: '联系人', dataIndex: 'contactName', width: 120, search: false },
    { title: '联系电话', dataIndex: 'contactPhone', width: 140, search: false },
    { title: '地址', dataIndex: 'address', width: 200, search: false },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueEnum: statusMap,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 240,
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
          values={{ parentId: record.id } as Company}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该公司？"
          onConfirm={async () => {
            try {
              await deleteCompany(record.id!);
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
      <ProTable<Company>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        pagination={false}
        expandable={{ defaultExpandAllRows: true }}
        request={async () => {
          const resp = (await listCompanys()) as { data?: Company[] };
          const data =
            (resp as unknown as { data?: Company[] }).data ??
            (Array.isArray(resp) ? (resp as Company[]) : []);
          const list = Array.isArray(data) ? data : [];
          return { data: list as never, success: true };
        }}
        search={false}
        toolBarRender={() => [
          <CreateForm
            key="create"
            trigger={<Button type="primary">新建公司</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default CompanyList;
