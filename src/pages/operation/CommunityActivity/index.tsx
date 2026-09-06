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
  addCommunityActivity,
  type CommunityActivity as CommunityActivityType,
  completeCommunityActivity,
  deleteCommunityActivity,
  listCommunityActivitys,
  updateCommunityActivity,
} from '@/services/smart-property/operation/communityActivity';

const activityTypeMap = {
  1: { text: '公益' },
  2: { text: '文体' },
  3: { text: '节日' },
  4: { text: '其他' },
};
const statusMap = {
  1: { text: '计划中', status: 'Default' },
  2: { text: '进行中', status: 'Processing' },
  3: { text: '已完成', status: 'Success' },
};

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: CommunityActivityType;
};

const CommunityActivityForm: React.FC<FormProps> = ({
  trigger,
  reload,
  values,
}) => {
  const isEdit = !!values?.id;
  const communityOptions = useCommunityOptions();
  return (
    <ModalForm<CommunityActivityType>
      title={isEdit ? '编辑社区活动' : '新建社区活动'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateCommunityActivity(values.id, vals);
          } else {
            await addCommunityActivity(vals);
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
        name="activityName"
        label="活动名称"
        rules={[{ required: true, message: '请输入活动名称' }]}
      />
      <ProFormSelect
        name="activityType"
        label="活动类型"
        options={[
          { label: '公益', value: 1 },
          { label: '文体', value: 2 },
          { label: '节日', value: 3 },
          { label: '其他', value: 4 },
        ]}
        rules={[{ required: true, message: '请选择活动类型' }]}
      />
      <ProFormDatePicker name="activityDate" label="活动日期" />
      <ProFormTimePicker name="startTime" label="开始时间" />
      <ProFormTimePicker name="endTime" label="结束时间" />
      <ProFormText name="location" label="活动地点" />
      <ProFormTextArea name="content" label="活动内容" />
      <ProFormDigit
        name="participantCount"
        label="参与人数"
        min={0}
        fieldProps={{ precision: 0 }}
      />
      <ProFormDigit
        name="budget"
        label="预算"
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormDigit
        name="actualCost"
        label="实际费用"
        min={0}
        fieldProps={{ precision: 2 }}
      />
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

const CommunityActivityList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const communityMap = useCommunityMap();

  const cols: ProColumns<CommunityActivityType>[] = [
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    {
      title: '活动名称',
      dataIndex: 'activityName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '活动类型',
      dataIndex: 'activityType',
      width: 90,
      valueEnum: activityTypeMap,
    },
    {
      title: '活动日期',
      dataIndex: 'activityDate',
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
      width: 160,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '活动地点',
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
    { title: '组织人', dataIndex: 'organizer', width: 100, search: false },
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
      width: 200,
      render: (_, record) => {
        const actions: React.ReactNode[] = [];
        if (record.status !== 3) {
          actions.push(
            <Popconfirm
              key="complete"
              title="确认完成该社区活动？"
              onConfirm={async () => {
                try {
                  await completeCommunityActivity(record.id!);
                  message.success('已完成');
                  actionRef.current?.reload();
                } catch {
                  message.error('操作失败');
                }
              }}
            >
              <a>完成</a>
            </Popconfirm>,
          );
        }
        actions.push(
          <CommunityActivityForm
            key="edit"
            trigger={<a>编辑</a>}
            values={record}
            reload={() => actionRef.current?.reload()}
          />,
        );
        actions.push(
          <Popconfirm
            key="del"
            title="确认删除该社区活动？"
            onConfirm={async () => {
              try {
                await deleteCommunityActivity(record.id!);
                message.success('删除成功');
                actionRef.current?.reload();
              } catch {
                message.error('删除失败');
              }
            }}
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>,
        );
        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<CommunityActivityType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listCommunityActivitys({
            current: params.current,
            pageSize: params.pageSize,
            communityId:
              typeof params.communityId === 'string'
                ? Number(params.communityId)
                : params.communityId,
            activityType:
              typeof params.activityType === 'string'
                ? Number(params.activityType)
                : params.activityType,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <CommunityActivityForm
            key="create"
            trigger={<Button type="primary">新建社区活动</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default CommunityActivityList;
