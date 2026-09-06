import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import {
  useCommunityMap,
  useCommunityOptions,
  useRoomNoMap,
  useRoomOptions,
} from '@/hooks/useOptions';
import {
  addCommitteeMember,
  type CommitteeMember as CommitteeMemberType,
  deleteCommitteeMember,
  listCommitteeMembers,
  updateCommitteeMember,
} from '@/services/smart-property/operation/committeeMember';

const statusMap = {
  1: { text: '在任', status: 'Success' },
  2: { text: '已离任', status: 'Default' },
};

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: CommitteeMemberType;
};

const CommitteeMemberForm: React.FC<FormProps> = ({
  trigger,
  reload,
  values,
}) => {
  const isEdit = !!values?.id;
  const communityOptions = useCommunityOptions();
  const roomOptions = useRoomOptions();

  return (
    <ModalForm<CommitteeMemberType>
      title={isEdit ? '编辑成员' : '新建成员'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateCommitteeMember(values.id, vals);
          } else {
            await addCommitteeMember(vals);
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
        name="memberName"
        label="成员姓名"
        rules={[{ required: true, message: '请输入成员姓名' }]}
      />
      <ProFormText name="position" label="职务" />
      <ProFormText name="phone" label="联系电话" />
      <ProFormSelect
        name="roomId"
        label="房间"
        options={roomOptions}
        showSearch
      />
      <ProFormDatePicker name="termStart" label="任期开始" />
      <ProFormDatePicker name="termEnd" label="任期结束" />
      <ProFormText name="photo" label="照片" />
      <ProFormTextArea name="introduction" label="简介" />
      <ProFormSelect
        name="status"
        label="状态"
        options={[
          { label: '在任', value: 1 },
          { label: '已离任', value: 2 },
        ]}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const CommitteeMemberList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const communityMap = useCommunityMap();
  const roomNoMap = useRoomNoMap();

  const cols: ProColumns<CommitteeMemberType>[] = [
    { title: '成员姓名', dataIndex: 'memberName', width: 120 },
    { title: '职务', dataIndex: 'position', width: 120 },
    { title: '联系电话', dataIndex: 'phone', width: 130, search: false },
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    {
      title: '房号',
      dataIndex: 'roomId',
      width: 110,
      ellipsis: true,
      search: false,
      render: (_, record) => roomNoMap[record.roomId ?? -1] ?? '-',
    },
    {
      title: '任期开始',
      dataIndex: 'termStart',
      width: 120,
      search: false,
      valueType: 'date',
    },
    {
      title: '任期结束',
      dataIndex: 'termEnd',
      width: 120,
      search: false,
      valueType: 'date',
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
        <CommitteeMemberForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该成员？"
          onConfirm={async () => {
            try {
              await deleteCommitteeMember(record.id!);
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
      <ProTable<CommitteeMemberType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listCommitteeMembers({
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
          <CommitteeMemberForm
            key="create"
            trigger={<Button type="primary">新建成员</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default CommitteeMemberList;
