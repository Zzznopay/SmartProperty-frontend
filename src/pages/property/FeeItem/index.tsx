import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
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
import {
  addFeeItem,
  deleteFeeItem,
  type FeeItem as FeeItemType,
  listFeeItems,
  updateFeeItem,
} from '@/services/smart-property/property/feeItem';

type Props = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: FeeItemType;
};

const FeeItemForm: React.FC<Props> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const feeTypeMap = useDict('fee_type', DICT_FALLBACKS.fee_type);
  const chargeModeMap = useDict('charge_mode', DICT_FALLBACKS.charge_mode);
  const billingCycleMap = useDict(
    'billing_cycle',
    DICT_FALLBACKS.billing_cycle,
  );

  return (
    <ModalForm<FeeItemType>
      title={isEdit ? '编辑费项' : '新建费项'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateFeeItem(values.id, vals);
          } else {
            await addFeeItem(vals);
          }
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText name="communityName" label="所属小区" />
      <ProFormText
        name="feeCode"
        label="费项编号"
        rules={[{ required: true, message: '请输入费项编号' }]}
      />
      <ProFormText
        name="feeName"
        label="费项名称"
        rules={[{ required: true, message: '请输入费项名称' }]}
      />
      <ProFormSelect
        name="feeType"
        label="费项类型"
        options={Object.entries(feeTypeMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormSelect
        name="chargeMode"
        label="收费方式"
        options={Object.entries(chargeModeMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormDigit
        name="unitPrice"
        label="单价"
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormText name="unit" label="计量单位" />
      <ProFormSelect
        name="billingCycle"
        label="计费周期"
        options={Object.entries(billingCycleMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormRadio.Group
        name="isActive"
        label="启用状态"
        options={[
          { label: '禁用', value: 0 },
          { label: '启用', value: 1 },
        ]}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const FeeItemList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message, modal } = App.useApp();
  const feeTypeMap = useDict('fee_type', DICT_FALLBACKS.fee_type);
  const chargeModeMap = useDict('charge_mode', DICT_FALLBACKS.charge_mode);
  const billingCycleMap = useDict(
    'billing_cycle',
    DICT_FALLBACKS.billing_cycle,
  );
  const activeEnum = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );

  const cols: ProColumns<FeeItemType>[] = [
    { title: '所属小区', dataIndex: 'communityName', width: 140 },
    { title: '费项编号', dataIndex: 'feeCode', width: 140 },
    { title: '费项名称', dataIndex: 'feeName', width: 140 },
    {
      title: '费项类型',
      dataIndex: 'feeType',
      width: 100,
      valueEnum: feeTypeMap,
    },
    {
      title: '收费方式',
      dataIndex: 'chargeMode',
      width: 100,
      valueEnum: chargeModeMap,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      width: 110,
      search: false,
      valueType: 'money',
    },
    { title: '单位', dataIndex: 'unit', width: 80, search: false },
    {
      title: '计费周期',
      dataIndex: 'billingCycle',
      width: 100,
      valueEnum: billingCycleMap,
    },
    {
      title: '启用',
      dataIndex: 'isActive',
      width: 80,
      valueEnum: activeEnum,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        <FeeItemForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <a
          key="del"
          style={{ color: 'red' }}
          onClick={() => {
            modal.confirm({
              title: '确认删除该费项？',
              onOk: async () => {
                try {
                  await deleteFeeItem(record.id!);
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
      <ProTable<FeeItemType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listFeeItems({
            current: params.current,
            pageSize: params.pageSize,
            feeName: params.feeName,
            feeCode: params.feeCode,
            communityName: params.communityName,
            feeType:
              typeof params.feeType === 'string'
                ? Number(params.feeType)
                : params.feeType,
            chargeMode:
              typeof params.chargeMode === 'string'
                ? Number(params.chargeMode)
                : params.chargeMode,
            billingCycle:
              typeof params.billingCycle === 'string'
                ? Number(params.billingCycle)
                : params.billingCycle,
            isActive:
              typeof params.isActive === 'string'
                ? Number(params.isActive)
                : params.isActive,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <FeeItemForm
            key="create"
            trigger={<Button type="primary">新建费项</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default FeeItemList;
