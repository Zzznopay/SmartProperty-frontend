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
  cleanLoginLogs,
  deleteLoginLog,
  type LoginLog,
  listLoginLogs,
} from '@/services/smart-property/system/loginLog';

const LoginLogList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message, modal } = App.useApp();
  const statusMap = useDict(
    'sys_common_status',
    DICT_FALLBACKS.sys_common_status,
  );

  const cols: ProColumns<LoginLog>[] = [
    { title: '日志ID', dataIndex: 'id', width: 100, search: false },
    { title: '用户名', dataIndex: 'username', width: 140 },
    { title: '登录IP', dataIndex: 'ip', width: 140 },
    { title: '登录地点', dataIndex: 'location', width: 180, search: false },
    { title: '浏览器', dataIndex: 'browser', width: 140, search: false },
    { title: '操作系统', dataIndex: 'os', width: 140, search: false },
    {
      title: '登录状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: statusMap,
    },
    { title: '提示消息', dataIndex: 'msg', width: 200, search: false },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      width: 180,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      render: (_, record) => [
        <Popconfirm
          key="del"
          title="确认删除该条日志？"
          onConfirm={async () => {
            try {
              await deleteLoginLog(record.id!);
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

  const handleClean = () => {
    modal.confirm({
      title: '确认清空全部登录日志?',
      content: '清空后无法恢复,请谨慎操作。',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await cleanLoginLogs();
          message.success('已清空');
          actionRef.current?.reload();
        } catch {
          message.error('清空失败');
        }
      },
    });
  };

  return (
    <PageContainer>
      <ProTable<LoginLog>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listLoginLogs({
            current: params.current,
            pageSize: params.pageSize,
            username: params.username,
            ip: params.ip,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <Button key="clean" danger onClick={handleClean}>
            清空
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default LoginLogList;
