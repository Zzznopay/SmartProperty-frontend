import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { useCommunityOptions } from '@/hooks/useOptions';
import {
  addNotice,
  deleteNotice,
  listNotices,
  type Notice as NoticeType,
  publishNotice,
  revokeNotice,
  updateNotice,
} from '@/services/smart-property/operation/notice';

const noticeTypeMap = {
  1: { text: '通知' },
  2: { text: '公告' },
  3: { text: '温馨提示' },
  4: { text: '紧急通知', status: 'Error' },
};
const isTopMap = {
  0: { text: '否' },
  1: { text: '是', status: 'Success' },
};
const isPublishMap = {
  0: { text: '否' },
  1: { text: '是', status: 'Success' },
};
const statusMap = {
  1: { text: '草稿', status: 'Default' },
  2: { text: '已发布', status: 'Success' },
  3: { text: '已撤回', status: 'Warning' },
};

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: NoticeType;
};

const NoticeForm: React.FC<FormProps> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const communityOptions = useCommunityOptions();

  return (
    <ModalForm<NoticeType>
      title={isEdit ? '编辑公告' : '新建公告'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateNotice(values.id, vals);
          } else {
            await addNotice(vals);
          }
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText
        name="noticeTitle"
        label="公告标题"
        rules={[{ required: true, message: '请输入公告标题' }]}
      />
      <ProFormTextArea
        name="noticeContent"
        label="公告内容"
        rules={[{ required: true, message: '请输入公告内容' }]}
      />
      <ProFormSelect
        name="noticeType"
        label="公告类型"
        options={[
          { label: '通知', value: 1 },
          { label: '公告', value: 2 },
          { label: '温馨提示', value: 3 },
          { label: '紧急通知', value: 4 },
        ]}
        rules={[{ required: true, message: '请选择公告类型' }]}
      />
      <ProFormSelect
        name="communityId"
        label="所属小区"
        options={communityOptions}
        showSearch
      />
      <ProFormSelect
        name="isTop"
        label="是否置顶"
        options={[
          { label: '否', value: 0 },
          { label: '是', value: 1 },
        ]}
        initialValue={0}
      />
      <ProFormDateTimePicker name="expireTime" label="过期时间" />
      <ProFormText name="images" label="图片" />
      <ProFormText name="attachments" label="附件" />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const NoticeList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();

  const cols: ProColumns<NoticeType>[] = [
    { title: '公告标题', dataIndex: 'noticeTitle', width: 180, ellipsis: true },
    {
      title: '类型',
      dataIndex: 'noticeType',
      width: 100,
      valueEnum: noticeTypeMap,
    },
    {
      title: '置顶',
      dataIndex: 'isTop',
      width: 80,
      search: false,
      valueEnum: isTopMap,
    },
    {
      title: '已发布',
      dataIndex: 'isPublish',
      width: 90,
      search: false,
      valueEnum: isPublishMap,
    },
    {
      title: '阅读数',
      dataIndex: 'readCount',
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
      title: '过期时间',
      dataIndex: 'expireTime',
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
      width: 200,
      render: (_, record) => {
        const actions: React.ReactNode[] = [];
        actions.push(
          <NoticeForm
            key="edit"
            trigger={<a>编辑</a>}
            values={record}
            reload={() => actionRef.current?.reload()}
          />,
        );
        if (record.status === 1) {
          actions.push(
            <Popconfirm
              key="publish"
              title="确认发布该公告？"
              onConfirm={async () => {
                try {
                  await publishNotice(record.id!);
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
        if (record.status === 2) {
          actions.push(
            <Popconfirm
              key="revoke"
              title="确认撤回该公告？"
              onConfirm={async () => {
                try {
                  await revokeNotice(record.id!);
                  message.success('撤回成功');
                  actionRef.current?.reload();
                } catch {
                  message.error('撤回失败');
                }
              }}
            >
              <a style={{ color: 'orange' }}>撤回</a>
            </Popconfirm>,
          );
        }
        actions.push(
          <Popconfirm
            key="del"
            title="确认删除该公告？"
            onConfirm={async () => {
              try {
                await deleteNotice(record.id!);
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
      <ProTable<NoticeType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listNotices({
            current: params.current,
            pageSize: params.pageSize,
            noticeType:
              typeof params.noticeType === 'string'
                ? Number(params.noticeType)
                : params.noticeType,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <NoticeForm
            key="create"
            trigger={<Button type="primary">新建公告</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default NoticeList;
