import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTimePicker,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import {
  useCommunityMap,
  useCommunityOptions,
  useUserOptions,
} from '@/hooks/useOptions';
import {
  addFirePatrol,
  deleteFirePatrol,
  type FirePatrol as FirePatrolType,
  listFirePatrols,
  updateFirePatrol,
} from '@/services/smart-property/operation/firePatrol';

const patrolResultMap = {
  1: { text: '正常', status: 'Success' },
  2: { text: '异常', status: 'Error' },
};
const statusMap = {
  1: { text: '待处理', status: 'Default' },
  2: { text: '已处理', status: 'Success' },
};

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: FirePatrolType;
};

const FirePatrolForm: React.FC<FormProps> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const communityOptions = useCommunityOptions();
  const userOptions = useUserOptions();
  return (
    <ModalForm<FirePatrolType>
      title={isEdit ? '编辑消防巡查' : '新建消防巡查'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateFirePatrol(values.id, vals);
          } else {
            await addFirePatrol(vals);
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
      <ProFormDatePicker name="patrolDate" label="巡查日期" />
      <ProFormTimePicker name="patrolTime" label="巡查时间" />
      <ProFormText
        name="patrolArea"
        label="巡查区域"
        rules={[{ required: true, message: '请输入巡查区域' }]}
      />
      <ProFormSelect
        name="patrolResult"
        label="巡查结果"
        options={[
          { label: '正常', value: 1 },
          { label: '异常', value: 2 },
        ]}
      />
      <ProFormTextArea name="problems" label="发现问题" />
      <ProFormSelect
        name="patrolUserId"
        label="巡查人"
        options={userOptions}
        showSearch
      />
      <ProFormText
        name="patrolUserName"
        label="巡查人姓名"
        placeholder="可留空，后端自动补全"
      />
      <ProFormTextArea name="handleContent" label="处理内容" />
      <ProFormSelect
        name="status"
        label="状态"
        options={[
          { label: '待处理', value: 1 },
          { label: '已处理', value: 2 },
        ]}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const FirePatrolList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const communityMap = useCommunityMap();

  const cols: ProColumns<FirePatrolType>[] = [
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    {
      title: '巡查日期',
      dataIndex: 'patrolDate',
      width: 120,
      search: false,
      valueType: 'date',
    },
    {
      title: '巡查时间',
      dataIndex: 'patrolTime',
      width: 100,
      search: false,
      valueType: 'time',
    },
    {
      title: '巡查区域',
      dataIndex: 'patrolArea',
      width: 160,
      ellipsis: true,
      search: false,
    },
    {
      title: '巡查结果',
      dataIndex: 'patrolResult',
      width: 90,
      search: false,
      valueEnum: patrolResultMap,
    },
    { title: '巡查人', dataIndex: 'patrolUserName', width: 100, search: false },
    {
      title: '处理内容',
      dataIndex: 'handleContent',
      width: 180,
      ellipsis: true,
      search: false,
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
        <FirePatrolForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该消防巡查？"
          onConfirm={async () => {
            try {
              await deleteFirePatrol(record.id!);
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
      <ProTable<FirePatrolType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listFirePatrols({
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
          <FirePatrolForm
            key="create"
            trigger={<Button type="primary">新建消防巡查</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default FirePatrolList;
