import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import {
  useCommunityMap,
  useCommunityOptions,
  useRoomOptions,
} from '@/hooks/useOptions';
import {
  addVisitRecord,
  leaveVisitRecord,
  listVisitRecords,
  type VisitRecord as VisitRecordType,
} from '@/services/smart-property/operation/visitRecord';

const statusMap = {
  1: { text: '在访', status: 'Processing' },
  2: { text: '已离开', status: 'Default' },
};

const CreateForm: React.FC<{
  trigger: React.ReactNode;
  reload?: () => void;
}> = ({ trigger, reload }) => {
  const communityOptions = useCommunityOptions();
  const roomOptions = useRoomOptions();
  return (
    <ModalForm<VisitRecordType>
      title="来访登记"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await addVisitRecord(vals);
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
      <ProFormText
        name="visitorName"
        label="访客姓名"
        rules={[{ required: true, message: '请输入访客姓名' }]}
      />
      <ProFormText name="visitorPhone" label="访客电话" />
      <ProFormText name="visitReason" label="来访事由" />
      <ProFormText name="visitTarget" label="被访对象" />
      <ProFormSelect
        name="roomId"
        label="房间"
        options={roomOptions}
        showSearch
      />
      <ProFormDateTimePicker
        name="visitTime"
        label="来访时间"
        rules={[{ required: true, message: '请选择来访时间' }]}
      />
      <ProFormDigit name="visitorCount" label="来访人数" min={1} />
      <ProFormText name="plateNo" label="车牌号" />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const VisitRecordList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const communityMap = useCommunityMap();

  const cols: ProColumns<VisitRecordType>[] = [
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    { title: '访客姓名', dataIndex: 'visitorName', width: 100, search: false },
    { title: '访客电话', dataIndex: 'visitorPhone', width: 120, search: false },
    {
      title: '被访对象',
      dataIndex: 'visitTarget',
      width: 140,
      search: false,
      ellipsis: true,
    },
    {
      title: '来访时间',
      dataIndex: 'visitTime',
      width: 170,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '离开时间',
      dataIndex: 'leaveTime',
      width: 170,
      search: false,
      valueType: 'dateTime',
    },
    { title: '来访人数', dataIndex: 'visitorCount', width: 90, search: false },
    { title: '车牌号', dataIndex: 'plateNo', width: 120, search: false },
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
      width: 100,
      render: (_, record) => {
        const actions: React.ReactNode[] = [];
        if (record.status === 1) {
          actions.push(
            <Popconfirm
              key="leave"
              title="确认登记该访客离开？"
              onConfirm={async () => {
                try {
                  await leaveVisitRecord(record.id!);
                  message.success('离开登记成功');
                  actionRef.current?.reload();
                } catch {
                  message.error('操作失败');
                }
              }}
            >
              <a>离开登记</a>
            </Popconfirm>,
          );
        }
        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<VisitRecordType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listVisitRecords({
            current: params.current,
            pageSize: params.pageSize,
            communityId:
              typeof params.communityId === 'string'
                ? Number(params.communityId)
                : params.communityId,
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
            trigger={<Button type="primary">来访登记</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default VisitRecordList;
