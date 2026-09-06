import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {
  listOwners,
  type Owner,
} from '@/services/smart-property/property/owner';
import { listRooms, type Room } from '@/services/smart-property/property/room';
import {
  addSaleContract,
  deleteSaleContract,
  deliverSaleContract,
  listSaleContracts,
  type SaleContract as SaleContractType,
} from '@/services/smart-property/property/saleContract';

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: SaleContractType;
  rooms: Room[];
  owners: Owner[];
};

const SALE_STATUS = {
  1: { text: '草稿', status: 'Default' },
  2: { text: '生效', status: 'Processing' },
  3: { text: '已作废', status: 'Error' },
} as const;

const PAY_TYPE = {
  1: { text: '全款' },
  2: { text: '按揭' },
  3: { text: '分期' },
} as const;

const SALE_DELIVERY = {
  0: { text: '未交付', status: 'Default' },
  1: { text: '已交付', status: 'Success' },
} as const;

const SaleContractForm: React.FC<FormProps> = ({
  trigger,
  reload,
  values,
  rooms,
  owners,
}) => {
  const isEdit = !!values?.id;
  return (
    <ModalForm<SaleContractType>
      title={isEdit ? '查看销售合同' : '新建销售合同'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      // 已生效/已作废/已交付不可编辑（最小可用版：用 status 判断）
      disabled={isEdit && values?.status !== 1}
      onFinish={async (vals) => {
        try {
          // 当前后端契约：没有 update 接口，新建即生效；已存在的合同走 deliver/delete
          await addSaleContract(vals as Partial<SaleContractType>);
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText
        name="contractNo"
        label="合同编号"
        rules={[{ required: true, message: '请输入合同编号' }]}
      />
      <ProFormSelect
        name="roomId"
        label="所属房间"
        rules={[{ required: true, message: '请选择房间' }]}
        options={rooms.map((r) => ({
          label: `${r.communityName ?? ''} ${r.buildingName ?? ''} ${r.roomNo ?? ''}`,
          value: r.id,
        }))}
        showSearch
      />
      <ProFormSelect
        name="ownerId"
        label="业主"
        rules={[{ required: true, message: '请选择业主' }]}
        options={owners.map((o) => ({
          label: `${o.ownerName} (${o.ownerCode})`,
          value: o.id,
        }))}
        showSearch
      />
      <ProFormDatePicker
        name="contractDate"
        label="签约日期"
        rules={[{ required: true, message: '请选择签约日期' }]}
      />
      <ProFormDigit
        name="salePrice"
        label="销售总价(元)"
        rules={[{ required: true, message: '请输入销售总价' }]}
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormSelect
        name="payType"
        label="付款方式"
        options={Object.entries(PAY_TYPE).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormDigit
        name="downPayment"
        label="首付(元)"
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormDigit
        name="loanAmount"
        label="贷款金额(元)"
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormDatePicker name="deliveryDate" label="约定交房日期" />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const SaleContractList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);

  useEffect(() => {
    listRooms({ pageSize: 9999 })
      .then((resp: unknown) => {
        const data = (resp as { data?: { data?: Room[] } })?.data?.data ?? [];
        setRooms(data);
      })
      .catch(() => setRooms([]));

    listOwners({ pageSize: 9999 })
      .then((resp: unknown) => {
        const data = (resp as { data?: { data?: Owner[] } })?.data?.data ?? [];
        setOwners(data);
      })
      .catch(() => setOwners([]));
  }, []);

  const cols: ProColumns<SaleContractType>[] = [
    { title: '合同编号', dataIndex: 'contractNo', width: 160 },
    {
      title: '房间号',
      dataIndex: 'roomNo',
      width: 140,
      search: false,
      ellipsis: true,
    },
    {
      title: '业主',
      dataIndex: 'ownerName',
      width: 140,
      search: false,
      ellipsis: true,
    },
    {
      title: '签约日期',
      dataIndex: 'contractDate',
      width: 120,
      valueType: 'date',
    },
    {
      title: '销售总价(元)',
      dataIndex: 'salePrice',
      width: 140,
      search: false,
      valueType: 'money',
    },
    {
      title: '付款方式',
      dataIndex: 'payType',
      width: 100,
      valueEnum: PAY_TYPE,
    },
    {
      title: '交付状态',
      dataIndex: 'deliveryStatus',
      width: 100,
      valueEnum: SALE_DELIVERY,
    },
    {
      title: '合同状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: SALE_STATUS,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 220,
      render: (_, record) => [
        <SaleContractForm
          key="view"
          trigger={<a>查看</a>}
          values={record}
          rooms={rooms}
          owners={owners}
        />,
        record.deliveryStatus !== 1 ? (
          <a
            key="deliver"
            onClick={async () => {
              try {
                await deliverSaleContract(record.id!);
                message.success('已交付');
                actionRef.current?.reload();
              } catch {
                message.error('操作失败');
              }
            }}
          >
            标记交付
          </a>
        ) : (
          <span key="delivered" style={{ color: '#999' }}>
            已交付
          </span>
        ),
        record.status !== 3 ? (
          <Popconfirm
            key="del"
            title="确认作废该销售合同？"
            onConfirm={async () => {
              try {
                await deleteSaleContract(record.id!);
                message.success('已作废');
                actionRef.current?.reload();
              } catch {
                message.error('操作失败');
              }
            }}
          >
            <a style={{ color: 'red' }}>作废</a>
          </Popconfirm>
        ) : null,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<SaleContractType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listSaleContracts({
            current: params.current,
            pageSize: params.pageSize,
            contractNo: params.contractNo,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <SaleContractForm
            key="create"
            trigger={<Button type="primary">新建销售合同</Button>}
            rooms={rooms}
            owners={owners}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default SaleContractList;
