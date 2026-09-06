import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App } from 'antd';
import React, { useRef } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  listPayments,
  type Payment as PaymentType,
  refundPayment,
  voidPayment,
} from '@/services/smart-property/property/payment';

type ActionProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  onSubmit: (reason: string) => Promise<void>;
};

const ReasonForm: React.FC<ActionProps> = ({ trigger, reload, onSubmit }) => (
  <ModalForm
    title="操作原因"
    trigger={trigger as React.ReactElement<unknown>}
    onFinish={async (vals) => {
      try {
        await onSubmit(vals.reason);
        reload?.();
        return true;
      } catch {
        return false;
      }
    }}
  >
    <ProFormTextArea
      name="reason"
      label="原因"
      rules={[{ required: true, message: '请填写原因' }]}
    />
  </ModalForm>
);

const PaymentList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const payTypeMap = useDict('pay_type', DICT_FALLBACKS.pay_type);
  const statusMap = useDict('payment_status', DICT_FALLBACKS.payment_status);

  const cols: ProColumns<PaymentType>[] = [
    { title: '收款单号', dataIndex: 'paymentNo', width: 180 },
    {
      title: '房号',
      dataIndex: 'roomNo',
      width: 140,
      ellipsis: true,
    },
    {
      title: '业主',
      dataIndex: 'ownerName',
      width: 140,
      ellipsis: true,
    },
    {
      title: '应收金额',
      dataIndex: 'totalAmount',
      width: 120,
      search: false,
      valueType: 'money',
    },
    {
      title: '实收金额',
      dataIndex: 'actualAmount',
      width: 120,
      search: false,
      valueType: 'money',
    },
    {
      title: '支付方式',
      dataIndex: 'payType',
      width: 100,
      valueEnum: payTypeMap,
    },
    {
      title: '收款时间',
      dataIndex: 'payTime',
      width: 170,
      valueType: 'dateTime',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: statusMap,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <ReasonForm
          key="refund"
          trigger={<a>退款</a>}
          reload={() => actionRef.current?.reload()}
          onSubmit={async (reason) => {
            await refundPayment(record.id!, { reason });
            message.success('退款成功');
          }}
        />,
        <ReasonForm
          key="void"
          trigger={<a style={{ color: 'red' }}>作废</a>}
          reload={() => actionRef.current?.reload()}
          onSubmit={async (reason) => {
            await voidPayment(record.id!, { reason });
            message.success('作废成功');
          }}
        />,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<PaymentType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listPayments({
            current: params.current,
            pageSize: params.pageSize,
            paymentNo: params.paymentNo,
            roomNo: params.roomNo,
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
        }}
        search={{ labelWidth: 100 }}
      />
    </PageContainer>
  );
};

export default PaymentList;
