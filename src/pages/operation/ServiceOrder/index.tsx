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
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { useUserOptions } from '@/hooks/useOptions';
import {
  addServiceOrder,
  assignServiceOrder,
  closeServiceOrder,
  handleServiceOrder,
  listServiceOrders,
  type ServiceOrder as ServiceOrderType,
  visitServiceOrder,
} from '@/services/smart-property/operation/serviceOrder';

const orderTypeMap = {
  1: { text: '报修' },
  2: { text: '投诉' },
  3: { text: '建议' },
  4: { text: '咨询' },
};
const priorityMap = {
  1: { text: '紧急', status: 'Error' },
  2: { text: '普通' },
  3: { text: '低' },
};
const statusMap = {
  1: { text: '待分配', status: 'Default' },
  2: { text: '处理中', status: 'Processing' },
  3: { text: '待回访', status: 'Warning' },
  4: { text: '已完成', status: 'Success' },
  5: { text: '已关闭', status: 'Default' },
};

const CreateForm: React.FC<{
  trigger: React.ReactNode;
  reload?: () => void;
}> = ({ trigger, reload }) => (
  <ModalForm<ServiceOrderType>
    title="新建工单"
    trigger={trigger as React.ReactElement<unknown>}
    onFinish={async (vals) => {
      try {
        await addServiceOrder(vals);
        reload?.();
        return true;
      } catch {
        return false;
      }
    }}
  >
    <ProFormSelect
      name="orderType"
      label="工单类型"
      options={[
        { label: '报修', value: 1 },
        { label: '投诉', value: 2 },
        { label: '建议', value: 3 },
        { label: '咨询', value: 4 },
      ]}
      rules={[{ required: true, message: '请选择工单类型' }]}
    />
    <ProFormText
      name="title"
      label="工单标题"
      rules={[{ required: true, message: '请输入工单标题' }]}
    />
    <ProFormTextArea
      name="content"
      label="工单内容"
      rules={[{ required: true, message: '请输入工单内容' }]}
    />
    <ProFormText name="ownerName" label="业主姓名" />
    <ProFormText name="ownerPhone" label="业主电话" />
    <ProFormSelect
      name="priority"
      label="优先级"
      options={[
        { label: '紧急', value: 1 },
        { label: '普通', value: 2 },
        { label: '低', value: 3 },
      ]}
      initialValue={2}
    />
    <ProFormTextArea name="remark" label="备注" />
  </ModalForm>
);

const ServiceOrderList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const userOptions = useUserOptions();

  const cols: ProColumns<ServiceOrderType>[] = [
    { title: '工单编号', dataIndex: 'orderNo', width: 150 },
    {
      title: '类型',
      dataIndex: 'orderType',
      width: 80,
      valueEnum: orderTypeMap,
    },
    { title: '标题', dataIndex: 'title', width: 180, ellipsis: true },
    { title: '业主', dataIndex: 'ownerName', width: 100, search: false },
    { title: '电话', dataIndex: 'ownerPhone', width: 120, search: false },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 80,
      valueEnum: priorityMap,
      search: false,
    },
    { title: '处理人', dataIndex: 'assignUserName', width: 100, search: false },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
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
        if (record.status === 1) {
          actions.push(
            <ModalForm
              key="assign"
              title="分配工单"
              trigger={<a>分配</a>}
              onFinish={async (vals: any) => {
                try {
                  await assignServiceOrder(
                    record.id!,
                    vals.assignUserId,
                    vals.assignUserName,
                  );
                  message.success('分配成功');
                  actionRef.current?.reload();
                  return true;
                } catch {
                  return false;
                }
              }}
            >
              <ProFormSelect
                name="assignUserId"
                label="处理人"
                options={userOptions}
                showSearch
                rules={[{ required: true, message: '请选择处理人' }]}
              />
              <ProFormText
                name="assignUserName"
                label="处理人姓名"
                placeholder="可留空，后端自动补全"
              />
            </ModalForm>,
          );
        }
        if (record.status === 2) {
          actions.push(
            <ModalForm
              key="handle"
              title="处理工单"
              trigger={<a>处理</a>}
              onFinish={async (vals: any) => {
                try {
                  await handleServiceOrder(record.id!, vals.handleContent);
                  message.success('处理成功');
                  actionRef.current?.reload();
                  return true;
                } catch {
                  return false;
                }
              }}
            >
              <ProFormTextArea
                name="handleContent"
                label="处理内容"
                rules={[{ required: true, message: '请输入处理内容' }]}
              />
            </ModalForm>,
          );
        }
        if (record.status === 3) {
          actions.push(
            <ModalForm
              key="visit"
              title="回访工单"
              trigger={<a>回访</a>}
              onFinish={async (vals: any) => {
                try {
                  await visitServiceOrder(
                    record.id!,
                    vals.visitContent,
                    vals.visitScore,
                  );
                  message.success('回访成功');
                  actionRef.current?.reload();
                  return true;
                } catch {
                  return false;
                }
              }}
            >
              <ProFormTextArea
                name="visitContent"
                label="回访内容"
                rules={[{ required: true, message: '请输入回访内容' }]}
              />
              <ProFormSelect
                name="visitScore"
                label="满意度评分"
                options={[
                  { label: '1分', value: 1 },
                  { label: '2分', value: 2 },
                  { label: '3分', value: 3 },
                  { label: '4分', value: 4 },
                  { label: '5分', value: 5 },
                ]}
                rules={[{ required: true, message: '请选择评分' }]}
              />
            </ModalForm>,
          );
        }
        if (record.status !== 4 && record.status !== 5) {
          actions.push(
            <Popconfirm
              key="close"
              title="确认关闭该工单？"
              onConfirm={async () => {
                try {
                  await closeServiceOrder(record.id!);
                  message.success('已关闭');
                  actionRef.current?.reload();
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
      <ProTable<ServiceOrderType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listServiceOrders({
            current: params.current,
            pageSize: params.pageSize,
            orderType:
              typeof params.orderType === 'string'
                ? Number(params.orderType)
                : params.orderType,
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
            trigger={<Button type="primary">新建工单</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default ServiceOrderList;
