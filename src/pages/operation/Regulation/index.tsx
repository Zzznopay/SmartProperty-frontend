import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import {
  addRegulation,
  deleteRegulation,
  listRegulations,
  publishRegulation,
  type Regulation as RegulationType,
} from '@/services/smart-property/operation/regulation';

const isPublishMap = {
  0: { text: '否' },
  1: { text: '是', status: 'Success' },
};
const statusMap = {
  1: { text: '草稿', status: 'Default' },
  2: { text: '已发布', status: 'Success' },
};

const CreateForm: React.FC<{
  trigger: React.ReactNode;
  reload?: () => void;
}> = ({ trigger, reload }) => (
  <ModalForm<RegulationType>
    title="新建规章制度"
    trigger={trigger as React.ReactElement<unknown>}
    onFinish={async (vals) => {
      try {
        await addRegulation(vals);
        reload?.();
        return true;
      } catch {
        return false;
      }
    }}
  >
    <ProFormText
      name="title"
      label="标题"
      rules={[{ required: true, message: '请输入标题' }]}
    />
    <ProFormTextArea
      name="content"
      label="内容"
      rules={[{ required: true, message: '请输入内容' }]}
    />
    <ProFormText name="category" label="分类" />
    <ProFormText name="fileUrl" label="文件地址" />
    <ProFormText name="fileName" label="文件名称" />
    <ProFormTextArea name="remark" label="备注" />
  </ModalForm>
);

const RegulationList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();

  const cols: ProColumns<RegulationType>[] = [
    { title: '标题', dataIndex: 'title', width: 200, ellipsis: true },
    { title: '分类', dataIndex: 'category', width: 120 },
    {
      title: '文件名称',
      dataIndex: 'fileName',
      width: 140,
      search: false,
      ellipsis: true,
    },
    {
      title: '已发布',
      dataIndex: 'isPublish',
      width: 90,
      search: false,
      valueEnum: isPublishMap,
    },
    {
      title: '浏览数',
      dataIndex: 'viewCount',
      width: 90,
      search: false,
      valueType: 'digit',
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      width: 170,
      search: false,
      valueType: 'dateTime',
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
      width: 160,
      render: (_, record) => {
        const actions: React.ReactNode[] = [];
        if (record.status === 1) {
          actions.push(
            <Popconfirm
              key="publish"
              title="确认发布该规章制度？"
              onConfirm={async () => {
                try {
                  await publishRegulation(record.id!);
                  message.success('发布成功');
                  actionRef.current?.reload();
                } catch {
                  message.error('发布失败');
                }
              }}
            >
              <a>发布</a>
            </Popconfirm>,
          );
        }
        actions.push(
          <Popconfirm
            key="del"
            title="确认删除该规章制度？"
            onConfirm={async () => {
              try {
                await deleteRegulation(record.id!);
                message.success('删除成功');
                actionRef.current?.reload();
              } catch {
                message.error('删除失败');
              }
            }}
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>,
        );
        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<RegulationType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listRegulations({
            current: params.current,
            pageSize: params.pageSize,
            category: params.category,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <CreateForm
            key="create"
            trigger={<Button type="primary">新建规章制度</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default RegulationList;
