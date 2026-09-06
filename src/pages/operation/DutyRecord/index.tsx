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
  addDutyRecord,
  type DutyRecord as DutyRecordType,
  deleteDutyRecord,
  listDutyRecords,
  updateDutyRecord,
} from '@/services/smart-property/operation/dutyRecord';

const statusMap = {
  1: { text: '正常', status: 'Success' },
  2: { text: '异常', status: 'Error' },
};

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: DutyRecordType;
};

const DutyRecordForm: React.FC<FormProps> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const communityOptions = useCommunityOptions();
  const userOptions = useUserOptions();
  return (
    <ModalForm<DutyRecordType>
      title={isEdit ? '编辑执勤记录' : '新建执勤记录'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateDutyRecord(values.id, vals);
          } else {
            await addDutyRecord(vals);
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
        rules={[{ required: true, message: '请选择所属小区' }]}
      />
      <ProFormDatePicker
        name="dutyDate"
        label="执勤日期"
        rules={[{ required: true, message: '请选择执勤日期' }]}
      />
      <ProFormTimePicker name="startTime" label="开始时间" />
      <ProFormTimePicker name="endTime" label="结束时间" />
      <ProFormText name="position" label="岗位" />
      <ProFormSelect
        name="securityId"
        label="保安"
        options={userOptions}
        showSearch
      />
      <ProFormText
        name="securityName"
        label="保安姓名"
        placeholder="可留空，后端自动补全"
      />
      <ProFormTextArea name="dutyContent" label="执勤内容" />
      <ProFormTextArea name="abnormalInfo" label="异常信息" />
      <ProFormSelect
        name="status"
        label="状态"
        options={[
          { label: '正常', value: 1 },
          { label: '异常', value: 2 },
        ]}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const DutyRecordList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const communityMap = useCommunityMap();

  const cols: ProColumns<DutyRecordType>[] = [
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    {
      title: '执勤日期',
      dataIndex: 'dutyDate',
      width: 120,
      valueType: 'date',
      search: false,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 110,
      search: false,
      valueType: 'time',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 110,
      search: false,
      valueType: 'time',
    },
    {
      title: '岗位',
      dataIndex: 'position',
      width: 120,
      search: false,
      ellipsis: true,
    },
    { title: '保安姓名', dataIndex: 'securityName', width: 100, search: false },
    {
      title: '执勤内容',
      dataIndex: 'dutyContent',
      width: 180,
      search: false,
      ellipsis: true,
    },
    { title: '状态', dataIndex: 'status', width: 90, valueEnum: statusMap },
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
        <DutyRecordForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该执勤记录？"
          onConfirm={async () => {
            try {
              await deleteDutyRecord(record.id!);
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
      <ProTable<DutyRecordType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listDutyRecords({
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
          <DutyRecordForm
            key="create"
            trigger={<Button type="primary">新建执勤记录</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default DutyRecordList;
