import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormSelect,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  deleteInvoice,
  type Invoice as InvoiceType,
  importInvoices,
  listInvoices,
  voidApplyInvoice,
} from '@/services/smart-property/property/invoice';

const ImportForm: React.FC<{ reload?: () => void }> = ({ reload }) => {
  const invoiceTypeMap = useDict('invoice_type', DICT_FALLBACKS.invoice_type);

  return (
    <ModalForm
      title="批量导入票据"
      trigger={<Button>导入票据号段</Button>}
      onFinish={async (vals) => {
        try {
          const raw = Array.isArray(vals.invoiceNos)
            ? (vals.invoiceNos as string[]).join('\n')
            : String(vals.invoiceNos ?? '');
          // 最小可用版：单条导入，前端组装（多条交给后端批量接口）
          const invoices: InvoiceType[] = raw
            .split(/[\n,\s]+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .map((invoiceNo) => ({
              invoiceNo,
              invoiceType: vals.invoiceType as 1 | 2,
            }));
          if (invoices.length === 0) {
            return false;
          }
          await importInvoices(invoices);
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormSelect
        name="invoiceType"
        label="票据类型"
        rules={[{ required: true, message: '请选择票据类型' }]}
        options={Object.entries(invoiceTypeMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormTextArea
        name="invoiceNos"
        label="票据编号"
        rules={[{ required: true, message: '请填写至少一个票据编号' }]}
        placeholder="支持换行/逗号/空格分隔多个编号"
        fieldProps={{ rows: 6 }}
      />
    </ModalForm>
  );
};

const VoidForm: React.FC<{
  record: InvoiceType;
  reload?: () => void;
}> = ({ record, reload }) => {
  const { message } = App.useApp();
  return (
    <ModalForm
      title={`作废票据 ${record.invoiceNo}`}
      trigger={<a style={{ color: 'red' }}>申请作废</a>}
      onFinish={async (vals) => {
        try {
          await voidApplyInvoice(record.id!, vals.reason as string);
          message.success('已提交作废申请');
          reload?.();
          return true;
        } catch {
          message.error('操作失败');
          return false;
        }
      }}
    >
      <ProFormTextArea
        name="reason"
        label="作废原因"
        rules={[{ required: true, message: '请填写作废原因' }]}
      />
    </ModalForm>
  );
};

const InvoiceList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const invoiceTypeMap = useDict('invoice_type', DICT_FALLBACKS.invoice_type);
  const statusMap = useDict('invoice_status', DICT_FALLBACKS.invoice_status);

  const cols: ProColumns<InvoiceType>[] = [
    { title: '票据编号', dataIndex: 'invoiceNo', width: 200 },
    {
      title: '票据类型',
      dataIndex: 'invoiceType',
      width: 90,
      valueEnum: invoiceTypeMap,
    },
    { title: '使用人', dataIndex: 'userName', width: 110, search: false },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueEnum: statusMap,
    },
    {
      title: '使用时间',
      dataIndex: 'useTime',
      width: 170,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '作废原因',
      dataIndex: 'voidReason',
      width: 180,
      search: false,
    },
    {
      title: '导入时间',
      dataIndex: 'createTime',
      width: 170,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        record.status === 1 ? (
          <VoidForm
            key="void"
            record={record}
            reload={() => actionRef.current?.reload()}
          />
        ) : null,
        record.status === 1 ? (
          <Popconfirm
            key="del"
            title="确认删除该票据？"
            onConfirm={async () => {
              try {
                await deleteInvoice(record.id!);
                message.success('删除成功');
                actionRef.current?.reload();
              } catch {
                message.error('删除失败');
              }
            }}
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        ) : null,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<InvoiceType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listInvoices({
            current: params.current,
            pageSize: params.pageSize,
            invoiceNo: params.invoiceNo,
            invoiceType:
              typeof params.invoiceType === 'string'
                ? Number(params.invoiceType)
                : params.invoiceType,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <ImportForm
            key="import"
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default InvoiceList;
