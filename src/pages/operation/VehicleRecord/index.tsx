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
import {
  useCommunityMap,
  useCommunityOptions,
  useParkingOptions,
} from '@/hooks/useOptions';
import {
  listVehicleRecords,
  type VehicleRecord as VehicleRecordType,
  vehicleEntry,
  vehicleExit,
  vehiclePay,
} from '@/services/smart-property/operation/vehicleRecord';

const vehicleTypeMap = {
  1: { text: '小型车' },
  2: { text: '大型车' },
  3: { text: '摩托车' },
};
const recordTypeMap = {
  1: { text: '入场', status: 'Processing' },
  2: { text: '出场', status: 'Default' },
};
const isTemporaryMap = {
  0: { text: '否' },
  1: { text: '是' },
};
const payStatusMap = {
  0: { text: '未缴', status: 'Error' },
  1: { text: '已缴', status: 'Success' },
};

const EntryForm: React.FC<{
  trigger: React.ReactNode;
  reload?: () => void;
}> = ({ trigger, reload }) => {
  const communityOptions = useCommunityOptions();
  const parkingOptions = useParkingOptions();
  return (
    <ModalForm<VehicleRecordType>
      title="车辆入场"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await vehicleEntry(vals);
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
        name="plateNo"
        label="车牌号"
        rules={[{ required: true, message: '请输入车牌号' }]}
      />
      <ProFormSelect
        name="vehicleType"
        label="车辆类型"
        options={[
          { label: '小型车', value: 1 },
          { label: '大型车', value: 2 },
          { label: '摩托车', value: 3 },
        ]}
        rules={[{ required: true, message: '请选择车辆类型' }]}
      />
      <ProFormText name="gateName" label="入口岗亭" />
      <ProFormSelect
        name="parkingId"
        label="车位"
        options={parkingOptions}
        showSearch
      />
      <ProFormSelect
        name="isTemporary"
        label="是否临时车"
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

const VehicleRecordList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const communityMap = useCommunityMap();

  const cols: ProColumns<VehicleRecordType>[] = [
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    { title: '车牌号', dataIndex: 'plateNo', width: 120, search: false },
    {
      title: '车辆类型',
      dataIndex: 'vehicleType',
      width: 100,
      valueEnum: vehicleTypeMap,
      search: false,
    },
    {
      title: '记录类型',
      dataIndex: 'recordType',
      width: 90,
      valueEnum: recordTypeMap,
    },
    {
      title: '记录时间',
      dataIndex: 'recordTime',
      width: 170,
      search: false,
      valueType: 'dateTime',
    },
    { title: '岗亭', dataIndex: 'gateName', width: 120, search: false },
    {
      title: '临时车',
      dataIndex: 'isTemporary',
      width: 80,
      valueEnum: isTemporaryMap,
      search: false,
    },
    {
      title: '费用',
      dataIndex: 'feeAmount',
      width: 90,
      search: false,
      valueType: 'digit',
    },
    {
      title: '缴费状态',
      dataIndex: 'payStatus',
      width: 90,
      valueEnum: payStatusMap,
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
        if (record.recordType === 1) {
          actions.push(
            <Popconfirm
              key="exit"
              title="确认该车辆出场？"
              onConfirm={async () => {
                try {
                  await vehicleExit(record.id!);
                  message.success('出场成功');
                  actionRef.current?.reload();
                } catch {
                  message.error('操作失败');
                }
              }}
            >
              <a>出场</a>
            </Popconfirm>,
          );
        }
        if (record.payStatus === 0) {
          actions.push(
            <Popconfirm
              key="pay"
              title="确认缴费？"
              onConfirm={async () => {
                try {
                  await vehiclePay(record.id!);
                  message.success('缴费成功');
                  actionRef.current?.reload();
                } catch {
                  message.error('操作失败');
                }
              }}
            >
              <a>缴费</a>
            </Popconfirm>,
          );
        }
        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<VehicleRecordType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listVehicleRecords({
            current: params.current,
            pageSize: params.pageSize,
            communityId:
              typeof params.communityId === 'string'
                ? Number(params.communityId)
                : params.communityId,
            recordType:
              typeof params.recordType === 'string'
                ? Number(params.recordType)
                : params.recordType,
            payStatus:
              typeof params.payStatus === 'string'
                ? Number(params.payStatus)
                : params.payStatus,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <EntryForm
            key="entry"
            trigger={<Button type="primary">车辆入场</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default VehicleRecordList;
