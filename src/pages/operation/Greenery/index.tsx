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
import React, { useRef } from 'react';
import { useCommunityOptions } from '@/hooks/useOptions';
import {
  addGreenery,
  deleteGreenery,
  type Greenery as GreeneryType,
  listGreeneries,
  updateGreenery,
} from '@/services/smart-property/operation/greenery';

const greeneryTypeMap = {
  1: { text: '乔木' },
  2: { text: '灌木' },
  3: { text: '草坪' },
  4: { text: '花卉' },
};
const statusMap = {
  1: { text: '正常', status: 'Success' },
  2: { text: '枯萎', status: 'Warning' },
  3: { text: '已移除', status: 'Default' },
};

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: GreeneryType;
};

const GreeneryForm: React.FC<FormProps> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const communityOptions = useCommunityOptions();
  return (
    <ModalForm<GreeneryType>
      title={isEdit ? '编辑绿化植被' : '新建绿化植被'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateGreenery(values.id, vals);
          } else {
            await addGreenery(vals);
          }
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
      />
      <ProFormText
        name="greeneryName"
        label="植被名称"
        rules={[{ required: true, message: '请输入植被名称' }]}
      />
      <ProFormSelect
        name="greeneryType"
        label="植被类型"
        options={[
          { label: '乔木', value: 1 },
          { label: '灌木', value: 2 },
          { label: '草坪', value: 3 },
          { label: '花卉', value: 4 },
        ]}
        rules={[{ required: true, message: '请选择植被类型' }]}
      />
      <ProFormText name="location" label="位置" />
      <ProFormDigit
        name="quantity"
        label="数量"
        min={0}
        fieldProps={{ precision: 0 }}
      />
      <ProFormDatePicker name="plantDate" label="种植日期" />
      <ProFormSelect
        name="status"
        label="状态"
        options={[
          { label: '正常', value: 1 },
          { label: '枯萎', value: 2 },
          { label: '已移除', value: 3 },
        ]}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const GreeneryList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();

  const cols: ProColumns<GreeneryType>[] = [
    { title: '植被名称', dataIndex: 'greeneryName', width: 160 },
    {
      title: '植被类型',
      dataIndex: 'greeneryType',
      width: 100,
      valueEnum: greeneryTypeMap,
    },
    {
      title: '位置',
      dataIndex: 'location',
      width: 180,
      search: false,
      ellipsis: true,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 80,
      search: false,
      valueType: 'digit',
    },
    {
      title: '种植日期',
      dataIndex: 'plantDate',
      width: 120,
      search: false,
      valueType: 'date',
    },
    { title: '状态', dataIndex: 'status', width: 100, valueEnum: statusMap },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 160,
      search: false,
      ellipsis: true,
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
      width: 160,
      render: (_, record) => [
        <GreeneryForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该绿化植被？"
          onConfirm={async () => {
            try {
              await deleteGreenery(record.id!);
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
      <ProTable<GreeneryType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listGreeneries({
            current: params.current,
            pageSize: params.pageSize,
            greeneryName: params.greeneryName,
            greeneryType:
              typeof params.greeneryType === 'string'
                ? Number(params.greeneryType)
                : params.greeneryType,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <GreeneryForm
            key="create"
            trigger={<Button type="primary">新建绿化植被</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default GreeneryList;
