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
  useRoomNoMap,
  useRoomOptions,
} from '@/hooks/useOptions';
import {
  addGoodsRecord,
  deleteGoodsRecord,
  type GoodsRecord as GoodsRecordType,
  listGoodsRecords,
} from '@/services/smart-property/operation/goodsRecord';

const recordTypeMap = {
  1: { text: '物品带入' },
  2: { text: '物品带出' },
};

const CreateForm: React.FC<{
  trigger: React.ReactNode;
  reload?: () => void;
}> = ({ trigger, reload }) => {
  const communityOptions = useCommunityOptions();
  const roomOptions = useRoomOptions();
  return (
    <ModalForm<GoodsRecordType>
      title="登记物品出入"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await addGoodsRecord(vals);
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
      <ProFormSelect
        name="recordType"
        label="记录类型"
        options={[
          { label: '物品带入', value: 1 },
          { label: '物品带出', value: 2 },
        ]}
        rules={[{ required: true, message: '请选择记录类型' }]}
      />
      <ProFormText
        name="goodsName"
        label="物品名称"
        rules={[{ required: true, message: '请输入物品名称' }]}
      />
      <ProFormTextArea name="goodsDesc" label="物品描述" />
      <ProFormDigit name="quantity" label="数量" min={1} />
      <ProFormText name="ownerName" label="物主姓名" />
      <ProFormSelect
        name="roomId"
        label="房间"
        options={roomOptions}
        showSearch
      />
      <ProFormText name="operatorName" label="操作人姓名" />
      <ProFormText name="operatorPhone" label="操作人电话" />
      <ProFormDateTimePicker name="operateTime" label="操作时间" />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const GoodsRecordList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const communityMap = useCommunityMap();
  const roomNoMap = useRoomNoMap();

  const cols: ProColumns<GoodsRecordType>[] = [
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    {
      title: '记录类型',
      dataIndex: 'recordType',
      width: 100,
      valueEnum: recordTypeMap,
    },
    { title: '物品名称', dataIndex: 'goodsName', width: 140, search: false },
    { title: '数量', dataIndex: 'quantity', width: 80, search: false },
    { title: '物主姓名', dataIndex: 'ownerName', width: 100, search: false },
    {
      title: '房号',
      dataIndex: 'roomId',
      width: 110,
      ellipsis: true,
      search: false,
      render: (_, record) => roomNoMap[record.roomId ?? -1] ?? '-',
    },
    { title: '操作人', dataIndex: 'operatorName', width: 100, search: false },
    {
      title: '操作时间',
      dataIndex: 'operateTime',
      width: 170,
      search: false,
      valueType: 'dateTime',
    },
    { title: '操作保安', dataIndex: 'guardName', width: 100, search: false },
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
      width: 80,
      render: (_, record) => [
        <Popconfirm
          key="del"
          title="确认删除该物品记录？"
          onConfirm={async () => {
            try {
              await deleteGoodsRecord(record.id!);
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

  return (
    <PageContainer>
      <ProTable<GoodsRecordType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listGoodsRecords({
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
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <CreateForm
            key="create"
            trigger={<Button type="primary">登记物品出入</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default GoodsRecordList;
