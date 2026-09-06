import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm, Tabs } from 'antd';
import React, { useRef } from 'react';
import {
  useCommunityMap,
  useCommunityOptions,
  useUserOptions,
} from '@/hooks/useOptions';
import {
  addOpinionBox,
  closeOpinionSubmit,
  deleteOpinionBox,
  listOpinionBoxes,
  listOpinionSubmits,
  type OpinionBox as OpinionBoxType,
  type OpinionSubmit as OpinionSubmitType,
  replyOpinionSubmit,
} from '@/services/smart-property/operation/opinionBox';

const isAnonymousMap = {
  0: { text: '否' },
  1: { text: '是' },
};
const isActiveMap = {
  0: { text: '否' },
  1: { text: '是' },
};
const submitStatusMap = {
  1: { text: '待处理', status: 'Default' },
  2: { text: '处理中', status: 'Processing' },
  3: { text: '已回复', status: 'Success' },
  4: { text: '已关闭', status: 'Default' },
};

const BoxCreateForm: React.FC<{
  trigger: React.ReactNode;
  reload?: () => void;
}> = ({ trigger, reload }) => {
  const communityOptions = useCommunityOptions();
  const userOptions = useUserOptions();
  return (
    <ModalForm<OpinionBoxType>
      title="新建意见箱"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await addOpinionBox(vals);
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText
        name="boxName"
        label="意见箱名称"
        rules={[{ required: true, message: '请输入意见箱名称' }]}
      />
      <ProFormSelect
        name="communityId"
        label="所属小区"
        options={communityOptions}
        showSearch
      />
      <ProFormSelect
        name="adminUserId"
        label="管理员"
        options={userOptions}
        showSearch
      />
      <ProFormText
        name="adminUserName"
        label="管理员姓名"
        placeholder="可留空，后端自动补全"
      />
      <ProFormSelect
        name="isAnonymous"
        label="是否匿名"
        options={[
          { label: '否', value: 0 },
          { label: '是', value: 1 },
        ]}
        initialValue={0}
      />
      <ProFormSelect
        name="isActive"
        label="是否启用"
        options={[
          { label: '否', value: 0 },
          { label: '是', value: 1 },
        ]}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const OpinionBoxList: React.FC = () => {
  const boxActionRef = useRef<ActionType | null>(null);
  const submitActionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const communityMap = useCommunityMap();

  const boxCols: ProColumns<OpinionBoxType>[] = [
    { title: '意见箱名称', dataIndex: 'boxName', width: 180, search: false },
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    { title: '管理员', dataIndex: 'adminUserName', width: 120, search: false },
    {
      title: '是否匿名',
      dataIndex: 'isAnonymous',
      width: 90,
      valueEnum: isAnonymousMap,
      search: false,
    },
    {
      title: '是否启用',
      dataIndex: 'isActive',
      width: 90,
      valueEnum: isActiveMap,
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 200,
      ellipsis: true,
      search: false,
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
      width: 100,
      render: (_, record) => [
        <Popconfirm
          key="del"
          title="确认删除该意见箱？"
          onConfirm={async () => {
            try {
              await deleteOpinionBox(record.id!);
              message.success('删除成功');
              boxActionRef.current?.reload();
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

  const submitCols: ProColumns<OpinionSubmitType>[] = [
    { title: '意见箱ID', dataIndex: 'boxId', width: 100, valueType: 'digit' },
    {
      title: '标题',
      dataIndex: 'title',
      width: 180,
      ellipsis: true,
      search: false,
    },
    {
      title: '内容',
      dataIndex: 'content',
      width: 220,
      ellipsis: true,
      search: false,
    },
    { title: '提交人', dataIndex: 'submitUserName', width: 100, search: false },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      width: 170,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: submitStatusMap,
    },
    {
      title: '回复内容',
      dataIndex: 'replyContent',
      width: 220,
      ellipsis: true,
      search: false,
    },
    {
      title: '回复时间',
      dataIndex: 'replyTime',
      width: 170,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '满意度',
      dataIndex: 'satisfaction',
      width: 80,
      search: false,
      valueType: 'digit',
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
      width: 140,
      render: (_, record) => {
        const actions: React.ReactNode[] = [];
        if (record.status !== 4) {
          actions.push(
            <ModalForm
              key="reply"
              title="回复意见"
              trigger={<a>回复</a>}
              onFinish={async (vals: any) => {
                try {
                  await replyOpinionSubmit(record.id!, vals.replyContent);
                  message.success('回复成功');
                  submitActionRef.current?.reload();
                  return true;
                } catch {
                  return false;
                }
              }}
            >
              <ProFormTextArea
                name="replyContent"
                label="回复内容"
                rules={[{ required: true, message: '请输入回复内容' }]}
              />
            </ModalForm>,
          );
          actions.push(
            <Popconfirm
              key="close"
              title="确认关闭该意见？"
              onConfirm={async () => {
                try {
                  await closeOpinionSubmit(record.id!);
                  message.success('已关闭');
                  submitActionRef.current?.reload();
                } catch {
                  message.error('操作失败');
                }
              }}
            >
              <a style={{ color: 'red' }}>关闭</a>
            </Popconfirm>,
          );
        }
        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <Tabs
        defaultActiveKey="boxes"
        items={[
          {
            key: 'boxes',
            label: '意见箱',
            children: (
              <ProTable<OpinionBoxType>
                actionRef={boxActionRef}
                rowKey="id"
                columns={boxCols}
                request={async (params) => {
                  const resp = await listOpinionBoxes({
                    current: params.current,
                    pageSize: params.pageSize,
                    communityId:
                      typeof params.communityId === 'string'
                        ? Number(params.communityId)
                        : params.communityId,
                  });
                  return resp as never;
                }}
                search={{ labelWidth: 100 }}
                toolBarRender={() => [
                  <BoxCreateForm
                    key="create"
                    trigger={<Button type="primary">新建意见箱</Button>}
                    reload={() => boxActionRef.current?.reload()}
                  />,
                ]}
              />
            ),
          },
          {
            key: 'submits',
            label: '意见列表',
            children: (
              <ProTable<OpinionSubmitType>
                actionRef={submitActionRef}
                rowKey="id"
                columns={submitCols}
                request={async (params) => {
                  const resp = await listOpinionSubmits({
                    current: params.current,
                    pageSize: params.pageSize,
                    boxId:
                      typeof params.boxId === 'string'
                        ? Number(params.boxId)
                        : params.boxId,
                    status:
                      typeof params.status === 'string'
                        ? Number(params.status)
                        : params.status,
                  });
                  return resp as never;
                }}
                search={{ labelWidth: 100 }}
              />
            ),
          },
        ]}
      />
    </PageContainer>
  );
};

export default OpinionBoxList;
