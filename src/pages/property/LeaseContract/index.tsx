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
import { App, Button, Modal } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  addLeaseContract,
  type LeaseContract as LeaseContractType,
  listLeaseContracts,
  terminateLease,
  updateLeaseContract,
} from '@/services/smart-property/property/leaseContract';
import { listRooms, type Room } from '@/services/smart-property/property/room';
import {
  listTenants,
  type Tenant,
} from '@/services/smart-property/property/tenant';

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: LeaseContractType;
  rooms: Room[];
  tenants: Tenant[];
};

const LeaseContractForm: React.FC<FormProps> = ({
  trigger,
  reload,
  values,
  rooms,
  tenants,
}) => {
  const isEdit = !!values?.id;
  const leaseTypeMap = useDict('lease_type', DICT_FALLBACKS.lease_type);
  const payCycleMap = useDict('pay_cycle', DICT_FALLBACKS.pay_cycle);
  const leaseStatusMap = useDict('lease_status', DICT_FALLBACKS.lease_status);

  return (
    <ModalForm<LeaseContractType>
      title={isEdit ? '编辑租赁合同' : '新建租赁合同'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateLeaseContract(values.id, vals);
          } else {
            await addLeaseContract(vals);
          }
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
        name="tenantId"
        label="租户"
        rules={[{ required: true, message: '请选择租户' }]}
        options={tenants.map((t) => ({
          label: `${t.tenantName} (${t.tenantCode})`,
          value: t.id,
        }))}
        showSearch
      />
      <ProFormSelect
        name="leaseType"
        label="租赁类型"
        options={Object.entries(leaseTypeMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormDatePicker
        name="startDate"
        label="起租日期"
        rules={[{ required: true, message: '请选择起租日期' }]}
      />
      <ProFormDatePicker
        name="endDate"
        label="到期日期"
        rules={[{ required: true, message: '请选择到期日期' }]}
      />
      <ProFormDigit
        name="rentAmount"
        label="租金(元)"
        rules={[{ required: true, message: '请输入租金' }]}
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormDigit
        name="deposit"
        label="押金(元)"
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormSelect
        name="payCycle"
        label="付款周期"
        options={Object.entries(payCycleMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormSelect
        name="status"
        label="合同状态"
        options={Object.entries(leaseStatusMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const LeaseContractList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const payCycleMap = useDict('pay_cycle', DICT_FALLBACKS.pay_cycle);
  const leaseStatusMap = useDict('lease_status', DICT_FALLBACKS.lease_status);

  useEffect(() => {
    listRooms({ pageSize: 9999 })
      .then((resp: unknown) => {
        const data = (resp as { data?: { data?: Room[] } })?.data?.data ?? [];
        setRooms(data);
      })
      .catch(() => setRooms([]));

    listTenants({ pageSize: 9999 })
      .then((resp: unknown) => {
        const data = (resp as { data?: { data?: Tenant[] } })?.data?.data ?? [];
        setTenants(data);
      })
      .catch(() => setTenants([]));
  }, []);

  // 行内"终止合同"轻量 Modal：收日期 + 原因
  const openTerminate = (id: number, contractNo: string) => {
    let pickedDate = '';
    let reason = '';
    Modal.confirm({
      title: `终止合同 ${contractNo}`,
      okText: '确认终止',
      cancelText: '取消',
      content: (
        <div style={{ marginTop: 8 }}>
          <input
            type="date"
            style={{
              width: '100%',
              padding: '6px 11px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              marginBottom: 8,
            }}
            onChange={(e) => {
              pickedDate = e.target.value;
            }}
          />
          <textarea
            placeholder="终止原因"
            style={{
              width: '100%',
              minHeight: 80,
              padding: '6px 11px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
            }}
            onChange={(e) => {
              reason = e.target.value;
            }}
          />
        </div>
      ),
      onOk: async () => {
        if (!pickedDate) {
          message.warning('请选择终止日期');
          return Promise.reject();
        }
        try {
          await terminateLease(id, {
            terminateDate: pickedDate,
            terminateReason: reason,
          });
          message.success('已终止');
          actionRef.current?.reload();
        } catch {
          message.error('操作失败');
        }
      },
    });
  };

  const cols: ProColumns<LeaseContractType>[] = [
    { title: '合同编号', dataIndex: 'contractNo', width: 160 },
    {
      title: '房间号',
      dataIndex: 'roomNo',
      width: 140,
      search: false,
      ellipsis: true,
    },
    {
      title: '租户',
      dataIndex: 'tenantName',
      width: 140,
      search: false,
      ellipsis: true,
    },
    {
      title: '起租日期',
      dataIndex: 'startDate',
      width: 120,
      valueType: 'date',
    },
    {
      title: '到期日期',
      dataIndex: 'endDate',
      width: 120,
      valueType: 'date',
    },
    {
      title: '租金(元)',
      dataIndex: 'rentAmount',
      width: 120,
      search: false,
      valueType: 'money',
    },
    {
      title: '付款周期',
      dataIndex: 'payCycle',
      width: 100,
      valueEnum: payCycleMap,
    },
    {
      title: '合同状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: leaseStatusMap,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 220,
      render: (_, record) => [
        <LeaseContractForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          rooms={rooms}
          tenants={tenants}
          reload={() => actionRef.current?.reload()}
        />,
        record.status === 1 || record.status === 2 ? (
          <a
            key="terminate"
            style={{ color: 'red' }}
            onClick={() => openTerminate(record.id!, record.contractNo)}
          >
            终止合同
          </a>
        ) : (
          <span key="terminated" style={{ color: '#999' }}>
            {leaseStatusMap[record.status!]?.text ?? '结束'}
          </span>
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<LeaseContractType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listLeaseContracts({
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
          <LeaseContractForm
            key="create"
            trigger={<Button type="primary">新建租赁合同</Button>}
            rooms={rooms}
            tenants={tenants}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default LeaseContractList;
