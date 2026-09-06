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
  ProFormTimePicker,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { useCommunityMap, useCommunityOptions } from '@/hooks/useOptions';
import {
  addFireDrill,
  deleteFireDrill,
  type FireDrill as FireDrillType,
  listFireDrills,
  updateFireDrill,
} from '@/services/smart-property/operation/fireDrill';

const drillTypeMap = {
  1: { text: '灭火演练' },
  2: { text: '疏散演练' },
  3: { text: '综合演练' },
};
const statusMap = {
  1: { text: '计划中', status: 'Default' },
  2: { text: '进行中', status: 'Processing' },
  3: { text: '已完成', status: 'Success' },
};

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: FireDrillType;
};

const FireDrillForm: React.FC<FormProps> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const communityOptions = useCommunityOptions();
  return (
    <ModalForm<FireDrillType>
      title={isEdit ? '编辑消防演练' : '新建消防演练'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateFireDrill(values.id, vals);
          } else {
            await addFireDrill(vals);
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
        name="drillName"
        label="演练名称"
        rules={[{ required: true, message: '请输入演练名称' }]}
      />
      <ProFormSelect
        name="drillType"
        label="演练类型"
        options={[
          { label: '灭火演练', value: 1 },
          { label: '疏散演练', value: 2 },
          { label: '综合演练', value: 3 },
        ]}
        rules={[{ required: true, message: '请选择演练类型' }]}
      />
      <ProFormDatePicker name="drillDate" label="演练日期" />
      <ProFormTimePicker name="startTime" label="开始时间" />
      <ProFormTimePicker name="endTime" label="结束时间" />
      <ProFormText name="location" label="演练地点" />
      <ProFormDigit
        name="participantCount"
        label="参与人数"
        min={0}
        fieldProps={{ precision: 0 }}
      />
      <ProFormTextArea name="drillContent" label="演练内容" />
      <ProFormTextArea name="drillSummary" label="演练总结" />
      <ProFormText name="organizer" label="组织人" />
      <ProFormSelect
        name="status"
        label="状态"
        options={[
          { label: '计划中', value: 1 },
          { label: '进行中', value: 2 },
          { label: '已完成', value: 3 },
        ]}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const FireDrillList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const communityMap = useCommunityMap();

  const cols: ProColumns<FireDrillType>[] = [
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    { title: '演练名称', dataIndex: 'drillName', width: 160, ellipsis: true },
    {
      title: '演练类型',
      dataIndex: 'drillType',
      width: 100,
      search: false,
      valueEnum: drillTypeMap,
    },
    {
      title: '演练日期',
      dataIndex: 'drillDate',
      width: 120,
      search: false,
      valueType: 'date',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 100,
      search: false,
      valueType: 'time',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 100,
      search: false,
      valueType: 'time',
    },
    {
      title: '演练地点',
      dataIndex: 'location',
      width: 160,
      ellipsis: true,
      search: false,
    },
    {
      title: '参与人数',
      dataIndex: 'participantCount',
      width: 90,
      search: false,
      valueType: 'digit',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      search: false,
      valueEnum: statusMap,
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
      width: 140,
      render: (_, record) => [
        <FireDrillForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该消防演练？"
          onConfirm={async () => {
            try {
              await deleteFireDrill(record.id!);
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
      <ProTable<FireDrillType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listFireDrills({
            current: params.current,
            pageSize: params.pageSize,
            communityId:
              typeof params.communityId === 'string'
                ? Number(params.communityId)
                : params.communityId,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <FireDrillForm
            key="create"
            trigger={<Button type="primary">新建消防演练</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default FireDrillList;
