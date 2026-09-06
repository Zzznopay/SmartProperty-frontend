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
import { App, Button, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  addCommunity,
  type Community as CommunityType,
  deleteCommunity,
  listCommunitys,
  updateCommunity,
} from '@/services/smart-property/property/community';

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: CommunityType;
};

const CommunityForm: React.FC<FormProps> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const statusEnum = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );
  const statusOptions = Object.entries(statusEnum).map(([value, v]) => ({
    label: v.text,
    value: Number(value),
  }));

  return (
    <ModalForm<CommunityType>
      title={isEdit ? '编辑小区' : '新建小区'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateCommunity(values.id, vals);
          } else {
            await addCommunity(vals);
          }
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText
        name="communityCode"
        label="小区编号"
        rules={[{ required: true, message: '请输入小区编号' }]}
      />
      <ProFormText
        name="communityName"
        label="小区名称"
        rules={[{ required: true, message: '请输入小区名称' }]}
      />
      <ProFormTextArea name="address" label="小区地址" />
      <ProFormDigit
        name="area"
        label="占地面积(㎡)"
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormDigit
        name="propertyFee"
        label="物业费(元/㎡)"
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormText name="contactName" label="联系人" />
      <ProFormText name="contactPhone" label="联系电话" />
      <ProFormSelect
        name="status"
        label="状态"
        options={statusOptions}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const CommunityList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const statusEnum = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );

  const cols: ProColumns<CommunityType>[] = [
    { title: '小区编号', dataIndex: 'communityCode', width: 140 },
    { title: '小区名称', dataIndex: 'communityName', width: 160 },
    {
      title: '地址',
      dataIndex: 'address',
      width: 220,
      ellipsis: true,
      search: false,
    },
    {
      title: '占地面积(㎡)',
      dataIndex: 'area',
      width: 120,
      search: false,
      valueType: 'digit',
    },
    {
      title: '楼宇数',
      dataIndex: 'buildingCount',
      width: 90,
      search: false,
      valueType: 'digit',
    },
    {
      title: '房间数',
      dataIndex: 'roomCount',
      width: 90,
      search: false,
      valueType: 'digit',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueEnum: statusEnum,
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
        <CommunityForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该小区？"
          onConfirm={async () => {
            try {
              await deleteCommunity(record.id!);
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
      <ProTable<CommunityType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listCommunitys({
            current: params.current,
            pageSize: params.pageSize,
            communityCode: params.communityCode,
            communityName: params.communityName,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <CommunityForm
            key="create"
            trigger={<Button type="primary">新建小区</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default CommunityList;
