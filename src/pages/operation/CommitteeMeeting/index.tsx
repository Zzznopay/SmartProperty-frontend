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
import { useCommunityMap, useCommunityOptions } from '@/hooks/useOptions';
import {
  addCommitteeMeeting,
  type CommitteeMeeting as CommitteeMeetingType,
  deleteCommitteeMeeting,
  listCommitteeMeetings,
  updateCommitteeMeeting,
} from '@/services/smart-property/operation/committeeMeeting';

const statusMap = {
  1: { text: '计划中', status: 'Default' },
  2: { text: '进行中', status: 'Processing' },
  3: { text: '已完成', status: 'Success' },
};

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: CommitteeMeetingType;
};

const CommitteeMeetingForm: React.FC<FormProps> = ({
  trigger,
  reload,
  values,
}) => {
  const isEdit = !!values?.id;
  const communityOptions = useCommunityOptions();

  return (
    <ModalForm<CommitteeMeetingType>
      title={isEdit ? '编辑会议' : '新建会议'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateCommitteeMeeting(values.id, vals);
          } else {
            await addCommitteeMeeting(vals);
          }
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText
        name="meetingTitle"
        label="会议标题"
        rules={[{ required: true, message: '请输入会议标题' }]}
      />
      <ProFormSelect
        name="communityId"
        label="所属小区"
        options={communityOptions}
        showSearch
      />
      <ProFormDatePicker name="meetingDate" label="会议日期" />
      <ProFormTimePicker name="startTime" label="开始时间" />
      <ProFormTimePicker name="endTime" label="结束时间" />
      <ProFormText name="location" label="会议地点" />
      <ProFormTextArea name="meetingContent" label="会议内容" />
      <ProFormTextArea name="meetingSummary" label="会议纪要" />
      <ProFormText name="attendees" label="参会人员" />
      <ProFormText name="images" label="图片" />
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

const CommitteeMeetingList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const communityMap = useCommunityMap();

  const cols: ProColumns<CommitteeMeetingType>[] = [
    {
      title: '会议标题',
      dataIndex: 'meetingTitle',
      width: 180,
      ellipsis: true,
    },
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    {
      title: '会议日期',
      dataIndex: 'meetingDate',
      width: 120,
      search: false,
      valueType: 'date',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 90,
      search: false,
      valueType: 'time',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 90,
      search: false,
      valueType: 'time',
    },
    {
      title: '会议地点',
      dataIndex: 'location',
      width: 140,
      search: false,
      ellipsis: true,
    },
    {
      title: '参会人员',
      dataIndex: 'attendees',
      width: 120,
      search: false,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
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
      width: 160,
      render: (_, record) => [
        <CommitteeMeetingForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该会议？"
          onConfirm={async () => {
            try {
              await deleteCommitteeMeeting(record.id!);
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
      <ProTable<CommitteeMeetingType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listCommitteeMeetings({
            current: params.current,
            pageSize: params.pageSize,
            communityId:
              typeof params.communityId === 'string'
                ? Number(params.communityId)
                : params.communityId,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <CommitteeMeetingForm
            key="create"
            trigger={<Button type="primary">新建会议</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default CommitteeMeetingList;
