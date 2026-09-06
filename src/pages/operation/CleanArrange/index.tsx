import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTimePicker,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { useCommunityOptions, useUserOptions } from '@/hooks/useOptions';
import {
  addCleanArrange,
  type CleanArrange as CleanArrangeType,
  completeCleanArrange,
  deleteCleanArrange,
  listCleanArranges,
} from '@/services/smart-property/operation/cleanArrange';

const cleanTypeMap = {
  1: { text: '日常' },
  2: { text: '定期' },
  3: { text: '专项' },
};
const statusMap = {
  1: { text: '待执行', status: 'Default' },
  2: { text: '执行中', status: 'Processing' },
  3: { text: '已完成', status: 'Success' },
};

const CreateForm: React.FC<{
  trigger: React.ReactNode;
  reload?: () => void;
}> = ({ trigger, reload }) => {
  const communityOptions = useCommunityOptions();
  const userOptions = useUserOptions();
  return (
    <ModalForm<CleanArrangeType>
      title="新建清洁安排"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await addCleanArrange(vals);
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormSelect
        name="communityId"
        label="所属小区"
        options={communityOptions}
        showSearch
      />
      <ProFormText
        name="areaName"
        label="区域名称"
        rules={[{ required: true, message: '请输入区域名称' }]}
      />
      <ProFormSelect
        name="cleanType"
        label="清洁类型"
        options={[
          { label: '日常', value: 1 },
          { label: '定期', value: 2 },
          { label: '专项', value: 3 },
        ]}
        rules={[{ required: true, message: '请选择清洁类型' }]}
      />
      <ProFormDatePicker
        name="arrangeDate"
        label="安排日期"
        rules={[{ required: true, message: '请选择安排日期' }]}
      />
      <ProFormTimePicker name="startTime" label="开始时间" />
      <ProFormTimePicker name="endTime" label="结束时间" />
      <ProFormSelect
        name="cleanerId"
        label="保洁员"
        options={userOptions}
        showSearch
      />
      <ProFormText
        name="cleanerName"
        label="保洁员姓名"
        placeholder="可留空，后端自动补全"
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const CleanArrangeList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();

  const cols: ProColumns<CleanArrangeType>[] = [
    { title: '区域名称', dataIndex: 'areaName', width: 160 },
    {
      title: '清洁类型',
      dataIndex: 'cleanType',
      width: 100,
      valueEnum: cleanTypeMap,
    },
    {
      title: '安排日期',
      dataIndex: 'arrangeDate',
      width: 120,
      search: false,
      valueType: 'date',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 100,
      search: false,
      valueType: 'time',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 100,
      search: false,
      valueType: 'time',
    },
    { title: '保洁员', dataIndex: 'cleanerName', width: 100, search: false },
    { title: '状态', dataIndex: 'status', width: 100, valueEnum: statusMap },
    {
      title: '完成时间',
      dataIndex: 'completeTime',
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
      width: 160,
      render: (_, record) => {
        const actions: React.ReactNode[] = [];
        if (record.status !== 3) {
          actions.push(
            <Popconfirm
              key="complete"
              title="确认完成该清洁安排？"
              onConfirm={async () => {
                try {
                  await completeCleanArrange(record.id!);
                  message.success('已完成');
                  actionRef.current?.reload();
                } catch {
                  message.error('操作失败');
                }
              }}
            >
              <a>完成</a>
            </Popconfirm>,
          );
        }
        actions.push(
          <Popconfirm
            key="del"
            title="确认删除该清洁安排？"
            onConfirm={async () => {
              try {
                await deleteCleanArrange(record.id!);
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
      <ProTable<CleanArrangeType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listCleanArranges({
            current: params.current,
            pageSize: params.pageSize,
            cleanType:
              typeof params.cleanType === 'string'
                ? Number(params.cleanType)
                : params.cleanType,
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
            trigger={<Button type="primary">新建清洁安排</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default CleanArrangeList;
