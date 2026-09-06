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
import { App, Button, Card, Popconfirm, Statistic } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useUserOptions } from '@/hooks/useOptions';
import {
  addMessage,
  getUnreadCount,
  listMessages,
  type Message as MessageType,
  readAllMessages,
  readMessage,
} from '@/services/smart-property/operation/message';

const messageTypeMap = {
  1: { text: '站内消息' },
  2: { text: '短信' },
  3: { text: '邮件' },
  4: { text: '微信推送' },
};
const isReadMap = {
  0: { text: '未读', status: 'Error' },
  1: { text: '已读', status: 'Success' },
};
const sendStatusMap = {
  0: { text: '待发送', status: 'Default' },
  1: { text: '已发送', status: 'Success' },
  2: { text: '发送失败', status: 'Error' },
};

const SendForm: React.FC<{
  trigger: React.ReactNode;
  reload?: () => void;
}> = ({ trigger, reload }) => {
  const userOptions = useUserOptions();
  return (
    <ModalForm<MessageType>
      title="发送消息"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await addMessage(vals);
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormSelect
        name="messageType"
        label="消息类型"
        options={[
          { label: '站内消息', value: 1 },
          { label: '短信', value: 2 },
          { label: '邮件', value: 3 },
          { label: '微信推送', value: 4 },
        ]}
        initialValue={1}
        rules={[{ required: true, message: '请选择消息类型' }]}
      />
      <ProFormSelect
        name="receiverId"
        label="接收人"
        options={userOptions}
        showSearch
      />
      <ProFormText
        name="receiverName"
        label="接收人姓名"
        placeholder="可留空，后端自动补全"
      />
      <ProFormText
        name="title"
        label="消息标题"
        rules={[{ required: true, message: '请输入消息标题' }]}
      />
      <ProFormTextArea
        name="content"
        label="消息内容"
        rules={[{ required: true, message: '请输入消息内容' }]}
      />
    </ModalForm>
  );
};

const MessageList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const [unread, setUnread] = useState<number>(0);

  const fetchUnread = async () => {
    try {
      const resp: any = await getUnreadCount();
      setUnread(resp?.data ?? 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnread();
  }, []);

  const cols: ProColumns<MessageType>[] = [
    {
      title: '消息标题',
      dataIndex: 'title',
      width: 200,
      ellipsis: true,
      search: false,
    },
    {
      title: '类型',
      dataIndex: 'messageType',
      width: 100,
      valueEnum: messageTypeMap,
      search: false,
    },
    { title: '接收人', dataIndex: 'receiverName', width: 120, search: false },
    {
      title: '是否已读',
      dataIndex: 'isRead',
      width: 100,
      valueEnum: isReadMap,
    },
    {
      title: '发送状态',
      dataIndex: 'sendStatus',
      width: 100,
      valueEnum: sendStatusMap,
      search: false,
    },
    {
      title: '发送时间',
      dataIndex: 'sendTime',
      width: 170,
      search: false,
      valueType: 'dateTime',
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
      render: (_, record) => {
        const actions: React.ReactNode[] = [];
        if (record.isRead === 0) {
          actions.push(
            <Popconfirm
              key="read"
              title="确认标记该消息为已读？"
              onConfirm={async () => {
                try {
                  await readMessage(record.id!);
                  message.success('已标记已读');
                  actionRef.current?.reload();
                  fetchUnread();
                } catch {
                  message.error('操作失败');
                }
              }}
            >
              <a>已读</a>
            </Popconfirm>,
          );
        }
        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <Card style={{ marginBottom: 16 }}>
        <Statistic title="未读消息" value={unread} />
      </Card>
      <ProTable<MessageType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listMessages({
            current: params.current,
            pageSize: params.pageSize,
            isRead:
              typeof params.isRead === 'string'
                ? Number(params.isRead)
                : params.isRead,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <SendForm
            key="send"
            trigger={<Button type="primary">发送消息</Button>}
            reload={() => {
              actionRef.current?.reload();
              fetchUnread();
            }}
          />,
          <Popconfirm
            key="readAll"
            title="确认将所有消息标记为已读？"
            onConfirm={async () => {
              try {
                await readAllMessages();
                message.success('已全部标记已读');
                actionRef.current?.reload();
                fetchUnread();
              } catch {
                message.error('操作失败');
              }
            }}
          >
            <Button>全部已读</Button>
          </Popconfirm>,
        ]}
      />
    </PageContainer>
  );
};

export default MessageList;
