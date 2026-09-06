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
  cleanOperLogs,
  deleteOperLog,
  listOperLogs,
  type OperLog,
} from '@/services/smart-property/system/operLog';

const OperLogList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message, modal } = App.useApp();
  const businessTypeMap = useDict('oper_type', DICT_FALLBACKS.oper_type);
  const statusMap = useDict(
    'sys_common_status',
    DICT_FALLBACKS.sys_common_status,
  );

  const cols: ProColumns<OperLog>[] = [
    { title: '日志ID', dataIndex: 'id', width: 100, search: false },
    { title: '模块名称', dataIndex: 'module', width: 140 },
    {
      title: '业务类型',
      dataIndex: 'businessType',
      width: 110,
      valueEnum: businessTypeMap,
    },
    { title: '操作人员', dataIndex: 'operName', width: 120 },
    { title: '请求地址', dataIndex: 'operUrl', width: 240, search: false },
    { title: '操作IP', dataIndex: 'operIp', width: 140 },
    {
      title: '请求方式',
      dataIndex: 'requestMethod',
      width: 100,
      search: false,
    },
    { title: '方法名称', dataIndex: 'method', width: 180, search: false },
    {
      title: '操作状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: statusMap,
    },
    {
      title: '耗时(ms)',
      dataIndex: 'costTime',
      width: 110,
      search: false,
      valueType: 'digit',
    },
    {
      title: '操作时间',
      dataIndex: 'operTime',
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
              await deleteOperLog(record.id!);
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
      title: '确认清空全部操作日志?',
      content: '清空后无法恢复,请谨慎操作。',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await cleanOperLogs();
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
      <ProTable<OperLog>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listOperLogs({
            current: params.current,
            pageSize: params.pageSize,
            module: params.module,
            operName: params.operName,
            businessType:
              typeof params.businessType === 'string'
                ? Number(params.businessType)
                : params.businessType,
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

export default OperLogList;
