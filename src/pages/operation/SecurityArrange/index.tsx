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
import {
  useCommunityMap,
  useCommunityOptions,
  useUserOptions,
} from '@/hooks/useOptions';
import {
  addSecurityArrange,
  completeSecurityArrange,
  deleteSecurityArrange,
  listSecurityArranges,
  type SecurityArrange as SecurityArrangeType,
} from '@/services/smart-property/operation/securityArrange';

const shiftTypeMap = {
  1: { text: '早班' },
  2: { text: '中班' },
  3: { text: '晚班' },
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
    <ModalForm<SecurityArrangeType>
      title="新建保安安排"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await addSecurityArrange(vals);
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
        rules={[{ required: true, message: '请选择所属小区' }]}
      />
      <ProFormDatePicker
        name="arrangeDate"
        label="安排日期"
        rules={[{ required: true, message: '请选择安排日期' }]}
      />
      <ProFormSelect
        name="shiftType"
        label="班次"
        options={[
          { label: '早班', value: 1 },
          { label: '中班', value: 2 },
          { label: '晚班', value: 3 },
        ]}
        rules={[{ required: true, message: '请选择班次' }]}
      />
      <ProFormTimePicker name="startTime" label="开始时间" />
      <ProFormTimePicker name="endTime" label="结束时间" />
      <ProFormText name="position" label="岗位" />
      <ProFormSelect
        name="securityId"
        label="保安"
        options={userOptions}
        showSearch
      />
      <ProFormText
        name="securityName"
        label="保安姓名"
        placeholder="可留空，后端自动补全"
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const SecurityArrangeList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const communityMap = useCommunityMap();

  const cols: ProColumns<SecurityArrangeType>[] = [
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    {
      title: '安排日期',
      dataIndex: 'arrangeDate',
      width: 120,
      valueType: 'date',
    },
    {
      title: '班次',
      dataIndex: 'shiftType',
      width: 80,
      valueEnum: shiftTypeMap,
      search: false,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 110,
      search: false,
      valueType: 'time',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 110,
      search: false,
      valueType: 'time',
    },
    {
      title: '岗位',
      dataIndex: 'position',
      width: 120,
      search: false,
      ellipsis: true,
    },
    { title: '保安姓名', dataIndex: 'securityName', width: 100, search: false },
    { title: '状态', dataIndex: 'status', width: 100, valueEnum: statusMap },
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
        if (record.status !== 3) {
          actions.push(
            <Popconfirm
              key="complete"
              title="确认完成该执勤安排？"
              onConfirm={async () => {
                try {
                  await completeSecurityArrange(record.id!);
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
            title="确认删除该保安安排？"
            onConfirm={async () => {
              try {
                await deleteSecurityArrange(record.id!);
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
      <ProTable<SecurityArrangeType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listSecurityArranges({
            current: params.current,
            pageSize: params.pageSize,
            communityId:
              typeof params.communityId === 'string'
                ? Number(params.communityId)
                : params.communityId,
            arrangeDate: params.arrangeDate,
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
            trigger={<Button type="primary">新建保安安排</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default SecurityArrangeList;
