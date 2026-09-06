import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button } from 'antd';
import dayjs from 'dayjs';
import React, { useRef } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  addPrepayment,
  listPrepayments,
  type Prepayment as PrepaymentType,
} from '@/services/smart-property/property/prepayment';

const PrepaymentForm: React.FC<{
  trigger: React.ReactNode;
  reload?: () => void;
}> = ({ trigger, reload }) => {
  const payTypeMap = useDict('pay_type', DICT_FALLBACKS.pay_type);

  return (
    <ModalForm<PrepaymentType>
      title="新增预收款"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await addPrepayment({
            ownerId: Number(vals.ownerId),
            amount: Number(vals.amount),
            payType: Number(vals.payType) as 1 | 2 | 3 | 4,
            payTime: vals.payTime
              ? dayjs(vals.payTime as string).format('YYYY-MM-DD HH:mm:ss')
              : undefined,
            remark: vals.remark,
          });
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormDigit
        name="ownerId"
        label="业主ID"
        rules={[{ required: true, message: '请输入业主ID' }]}
      />
      <ProFormDigit
        name="amount"
        label="金额"
        min={0}
        fieldProps={{ precision: 2 }}
        rules={[{ required: true, message: '请输入金额' }]}
      />
      <ProFormSelect
        name="payType"
        label="支付方式"
        rules={[{ required: true, message: '请选择支付方式' }]}
        options={Object.entries(payTypeMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormDatePicker
        name="payTime"
        label="收款时间"
        rules={[{ required: true, message: '请选择收款时间' }]}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const PrepaymentList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const payTypeMap = useDict('pay_type', DICT_FALLBACKS.pay_type);
  const statusMap = useDict(
    'prepayment_status',
    DICT_FALLBACKS.prepayment_status,
  );

  const cols: ProColumns<PrepaymentType>[] = [
    { title: '业主', dataIndex: 'ownerName', width: 140 },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
      search: false,
      valueType: 'money',
    },
    {
      title: '已用金额',
      dataIndex: 'usedAmount',
      width: 120,
      search: false,
      valueType: 'money',
    },
    {
      title: '余额',
      dataIndex: 'balance',
      width: 120,
      search: false,
      valueType: 'money',
    },
    {
      title: '收款时间',
      dataIndex: 'payTime',
      width: 170,
      valueType: 'dateTime',
    },
    {
      title: '支付方式',
      dataIndex: 'payType',
      width: 100,
      valueEnum: payTypeMap,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: statusMap,
    },
  ];

  return (
    <PageContainer>
      <ProTable<PrepaymentType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          try {
            const resp = await listPrepayments({
              current: params.current,
              pageSize: params.pageSize,
              ownerName: params.ownerName,
              payType:
                typeof params.payType === 'string'
                  ? Number(params.payType)
                  : params.payType,
              status:
                typeof params.status === 'string'
                  ? Number(params.status)
                  : params.status,
              payTime: params.payTime,
            });
            return resp as never;
          } catch {
            message.error('加载失败');
            return { data: [], success: false, total: 0 };
          }
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <PrepaymentForm
            key="create"
            trigger={<Button type="primary">新增预收款</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default PrepaymentList;
