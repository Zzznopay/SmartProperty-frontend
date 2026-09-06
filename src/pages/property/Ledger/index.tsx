import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDatePicker,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import { useCommunityOptions } from '@/hooks/useOptions';
import {
  type FeeItem,
  listFeeItems,
} from '@/services/smart-property/property/feeItem';
import {
  arrearsLedgers,
  generateLedger,
  type Ledger as LedgerType,
  listLedgers,
} from '@/services/smart-property/property/ledger';

type GenerateProps = {
  trigger: React.ReactNode;
  reload?: () => void;
};

const GenerateForm: React.FC<GenerateProps> = ({ trigger, reload }) => {
  const communityOptions = useCommunityOptions();
  const [feeItemOptions, setFeeItemOptions] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    listFeeItems({ current: 1, pageSize: 500 })
      .then((resp: unknown) => {
        const items =
          (resp as { data?: FeeItem[] })?.data?.map((f) => ({
            label: f.communityName
              ? `${f.feeName}（${f.communityName}）`
              : f.feeName,
            value: f.id!,
          })) ?? [];
        setFeeItemOptions(items);
      })
      .catch(() => setFeeItemOptions([]));
  }, []);

  return (
    <ModalForm
      title="生成物业费"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await generateLedger({
            communityId: Number(vals.communityId),
            ledgerMonth: (
              vals.ledgerMonth as { format: (s: string) => string }
            ).format('YYYY-MM'),
            feeItemIds: (vals.feeItemIds as number[]) ?? [],
          });
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
        rules={[{ required: true, message: '请选择小区' }]}
      />
      <ProFormDatePicker
        name="ledgerMonth"
        label="账期月份"
        rules={[{ required: true, message: '请选择账期月份' }]}
        picker="month"
      />
      <ProFormSelect
        name="feeItemIds"
        label="费项"
        mode="multiple"
        options={feeItemOptions}
        showSearch
        allowClear
        tooltip="不选表示按小区下全部启用费项生成"
      />
    </ModalForm>
  );
};

const LedgerList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<'list' | 'arrears'>('list');
  const statusMap = useDict('ledger_status', DICT_FALLBACKS.ledger_status);

  const cols: ProColumns<LedgerType>[] = [
    { title: '小区', dataIndex: 'communityName', width: 140 },
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
    { title: '费项', dataIndex: 'feeItemName', width: 140 },
    {
      title: '账期',
      dataIndex: 'ledgerMonth',
      width: 100,
      valueType: 'dateMonth',
    },
    {
      title: '应收',
      dataIndex: 'amount',
      width: 110,
      search: false,
      valueType: 'money',
    },
    {
      title: '已收',
      dataIndex: 'paidAmount',
      width: 110,
      search: false,
      valueType: 'money',
    },
    {
      title: '滞纳金',
      dataIndex: 'lateFee',
      width: 110,
      search: false,
      valueType: 'money',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: statusMap,
    },
    {
      title: '到期日',
      dataIndex: 'dueDate',
      width: 120,
      valueType: 'date',
    },
  ];

  const requestFn = async (params: Record<string, unknown>) => {
    const fetcher = activeTab === 'arrears' ? arrearsLedgers : listLedgers;
    try {
      const resp = await fetcher({
        current: params.current,
        pageSize: params.pageSize,
        communityName: params.communityName,
        roomNo: params.roomNo,
        ownerName: params.ownerName,
        feeItemName: params.feeItemName,
        ledgerMonth: params.ledgerMonth,
        status:
          typeof params.status === 'string'
            ? Number(params.status)
            : params.status,
        dueDate: params.dueDate,
      });
      return resp as never;
    } catch {
      message.error('加载失败');
      return { data: [], success: false, total: 0 };
    }
  };

  const ListTable = (
    <ProTable<LedgerType>
      key={activeTab}
      actionRef={actionRef}
      rowKey="id"
      columns={cols}
      request={requestFn}
      search={{ labelWidth: 100 }}
    />
  );

  return (
    <PageContainer
      title="台帐管理"
      tabList={[
        { key: 'list', tab: '台帐查询' },
        { key: 'arrears', tab: '欠费查询' },
      ]}
      tabActiveKey={activeTab}
      onTabChange={(key: string) => {
        setActiveTab(key as 'list' | 'arrears');
        actionRef.current?.reload();
      }}
      extra={[
        <GenerateForm
          key="gen"
          trigger={<Button type="primary">生成物业费</Button>}
          reload={() => actionRef.current?.reload()}
        />,
      ]}
    >
      {ListTable}
    </PageContainer>
  );
};

export default LedgerList;
