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
import { useCommunityOptions, useUserOptions } from '@/hooks/useOptions';
import {
  addCleanCheck,
  type CleanCheck as CleanCheckType,
  deleteCleanCheck,
  listCleanChecks,
  updateCleanCheck,
} from '@/services/smart-property/operation/cleanCheck';

const checkResultMap = {
  1: { text: '合格', status: 'Success' },
  2: { text: '不合格', status: 'Error' },
};

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: CleanCheckType;
};

const CleanCheckForm: React.FC<FormProps> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const communityOptions = useCommunityOptions();
  const userOptions = useUserOptions();
  return (
    <ModalForm<CleanCheckType>
      title={isEdit ? '编辑清洁检查' : '新建清洁检查'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateCleanCheck(values.id, vals);
          } else {
            await addCleanCheck(vals);
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
      <ProFormDigit name="arrangeId" label="关联安排ID" min={0} />
      <ProFormDatePicker name="checkDate" label="检查日期" />
      <ProFormText
        name="areaName"
        label="区域名称"
        rules={[{ required: true, message: '请输入区域名称' }]}
      />
      <ProFormSelect
        name="checkResult"
        label="检查结果"
        options={[
          { label: '合格', value: 1 },
          { label: '不合格', value: 2 },
        ]}
        rules={[{ required: true, message: '请选择检查结果' }]}
      />
      <ProFormDigit
        name="score"
        label="得分"
        min={0}
        fieldProps={{ precision: 0 }}
      />
      <ProFormTextArea name="problems" label="存在问题" />
      <ProFormSelect
        name="checkerId"
        label="检查人"
        options={userOptions}
        showSearch
      />
      <ProFormText
        name="checkerName"
        label="检查人姓名"
        placeholder="可留空，后端自动补全"
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const CleanCheckList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();

  const cols: ProColumns<CleanCheckType>[] = [
    { title: '区域名称', dataIndex: 'areaName', width: 160 },
    {
      title: '检查日期',
      dataIndex: 'checkDate',
      width: 120,
      search: false,
      valueType: 'date',
    },
    {
      title: '检查结果',
      dataIndex: 'checkResult',
      width: 100,
      valueEnum: checkResultMap,
    },
    {
      title: '得分',
      dataIndex: 'score',
      width: 80,
      search: false,
      valueType: 'digit',
    },
    {
      title: '存在问题',
      dataIndex: 'problems',
      width: 200,
      search: false,
      ellipsis: true,
    },
    { title: '检查人', dataIndex: 'checkerName', width: 100, search: false },
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
        <CleanCheckForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该清洁检查？"
          onConfirm={async () => {
            try {
              await deleteCleanCheck(record.id!);
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
      <ProTable<CleanCheckType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listCleanChecks({
            current: params.current,
            pageSize: params.pageSize,
            areaName: params.areaName,
            checkResult:
              typeof params.checkResult === 'string'
                ? Number(params.checkResult)
                : params.checkResult,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <CleanCheckForm
            key="create"
            trigger={<Button type="primary">新建清洁检查</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default CleanCheckList;
