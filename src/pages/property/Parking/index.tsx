import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDatePicker,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button } from 'antd';
import React, { useRef } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import { useOwnerOptions } from '@/hooks/useOptions';
import {
  addParking,
  deleteParking,
  listParkings,
  type Parking as ParkingType,
  rentParking,
  saleParking,
} from '@/services/smart-property/property/parking';

// 车位管理：后端提供 list/add/delete/sale/rent，未提供 update(编辑) 与 parking-payments(缴费)，
// 故移除"编辑""缴费"入口，保留其余能力，待后端补齐后再开放。
type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
};

const ParkingForm: React.FC<FormProps> = ({ trigger, reload }) => {
  const parkingTypeMap = useDict('parking_type', DICT_FALLBACKS.parking_type);
  const statusMap = useDict('parking_status', DICT_FALLBACKS.parking_status);

  return (
    <ModalForm<ParkingType>
      title="新建车位"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await addParking(vals);
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText name="communityName" label="所属小区" />
      <ProFormText
        name="parkingNo"
        label="车位编号"
        rules={[{ required: true, message: '请输入车位编号' }]}
      />
      <ProFormSelect
        name="parkingType"
        label="车位类型"
        options={Object.entries(parkingTypeMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormDigit
        name="parkingArea"
        label="车位面积"
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormRadio.Group
        name="status"
        label="状态"
        options={Object.entries(statusMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

type SaleProps = {
  trigger: React.ReactNode;
  parkingId: number;
  reload?: () => void;
};

const SaleForm: React.FC<SaleProps> = ({ trigger, parkingId, reload }) => {
  const ownerOptions = useOwnerOptions();

  return (
    <ModalForm
      title="销售车位"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await saleParking(parkingId, {
            ownerId: Number(vals.ownerId),
            salePrice: Number(vals.salePrice),
            saleDate: (
              vals.saleDate as { format: (s: string) => string }
            ).format('YYYY-MM-DD'),
          });
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormSelect
        name="ownerId"
        label="业主"
        options={ownerOptions}
        showSearch
        rules={[{ required: true, message: '请选择业主' }]}
      />
      <ProFormDigit
        name="salePrice"
        label="销售价格"
        min={0}
        rules={[{ required: true, message: '请输入销售价格' }]}
        fieldProps={{ precision: 2 }}
      />
      <ProFormDatePicker
        name="saleDate"
        label="销售日期"
        rules={[{ required: true, message: '请选择销售日期' }]}
      />
    </ModalForm>
  );
};

type RentProps = {
  trigger: React.ReactNode;
  parkingId: number;
  reload?: () => void;
};

const RentForm: React.FC<RentProps> = ({ trigger, parkingId, reload }) => (
  <ModalForm
    title="出租车位"
    trigger={trigger as React.ReactElement<unknown>}
    onFinish={async (vals) => {
      try {
        await rentParking(parkingId, {
          tenantId: Number(vals.tenantId),
          rentPrice: Number(vals.rentPrice),
          startDate: (
            vals.startDate as { format: (s: string) => string }
          ).format('YYYY-MM-DD'),
          endDate: (vals.endDate as { format: (s: string) => string }).format(
            'YYYY-MM-DD',
          ),
        });
        reload?.();
        return true;
      } catch {
        return false;
      }
    }}
  >
    <ProFormDigit
      name="tenantId"
      label="租户ID"
      placeholder="请填写租户编号（租户 ID）"
      rules={[{ required: true, message: '请输入租户ID' }]}
    />
    <ProFormDigit
      name="rentPrice"
      label="租金"
      min={0}
      rules={[{ required: true, message: '请输入租金' }]}
      fieldProps={{ precision: 2 }}
    />
    <ProFormDatePicker
      name="startDate"
      label="起始日期"
      rules={[{ required: true, message: '请选择起始日期' }]}
    />
    <ProFormDatePicker
      name="endDate"
      label="结束日期"
      rules={[{ required: true, message: '请选择结束日期' }]}
    />
  </ModalForm>
);

const ParkingList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message, modal } = App.useApp();
  const parkingTypeMap = useDict('parking_type', DICT_FALLBACKS.parking_type);
  const statusMap = useDict('parking_status', DICT_FALLBACKS.parking_status);

  const cols: ProColumns<ParkingType>[] = [
    { title: '所属小区', dataIndex: 'communityName', width: 140 },
    { title: '车位编号', dataIndex: 'parkingNo', width: 120 },
    {
      title: '车位类型',
      dataIndex: 'parkingType',
      width: 100,
      valueEnum: parkingTypeMap,
    },
    {
      title: '业主',
      dataIndex: 'ownerName',
      width: 140,
      ellipsis: true,
      render: (_, record) => record.ownerName ?? record.tenantName ?? '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: statusMap,
    },
    {
      title: '销售/租金',
      dataIndex: 'salePrice',
      width: 140,
      search: false,
      render: (_, record) => {
        const fmt = (n: number) =>
          `¥${Number(n).toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        if (record.salePrice !== undefined && record.salePrice !== null) {
          return `销售 ${fmt(record.salePrice)}`;
        }
        if (record.rentPrice !== undefined && record.rentPrice !== null) {
          return `出租 ${fmt(record.rentPrice)}`;
        }
        return '-';
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 220,
      render: (_, record) => [
        <SaleForm
          key="sale"
          trigger={<a>销售</a>}
          parkingId={record.id!}
          reload={() => actionRef.current?.reload()}
        />,
        <RentForm
          key="rent"
          trigger={<a>出租</a>}
          parkingId={record.id!}
          reload={() => actionRef.current?.reload()}
        />,
        <a
          key="del"
          style={{ color: 'red' }}
          onClick={() => {
            modal.confirm({
              title: '确认删除该车位？',
              onOk: async () => {
                try {
                  await deleteParking(record.id!);
                  message.success('删除成功');
                  actionRef.current?.reload();
                } catch {
                  message.error('删除失败');
                }
              },
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<ParkingType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listParkings({
            current: params.current,
            pageSize: params.pageSize,
            communityName: params.communityName,
            parkingNo: params.parkingNo,
            parkingType:
              typeof params.parkingType === 'string'
                ? Number(params.parkingType)
                : params.parkingType,
            ownerName: params.ownerName,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <ParkingForm
            key="create"
            trigger={<Button type="primary">新建车位</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default ParkingList;
