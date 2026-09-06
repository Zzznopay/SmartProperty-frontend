import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProDescriptions,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Drawer, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  addOwner,
  deleteOwner,
  getOwner,
  listOwners,
  type Owner as OwnerType,
  updateOwner,
} from '@/services/smart-property/property/owner';

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: OwnerType;
};

const OwnerForm: React.FC<FormProps> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const statusEnum = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );
  const ownerTypeMap = useDict('owner_type', DICT_FALLBACKS.owner_type);

  return (
    <ModalForm<OwnerType>
      title={isEdit ? '编辑业主' : '新建业主'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateOwner(values.id, vals);
          } else {
            await addOwner(vals);
          }
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText
        name="ownerCode"
        label="业主编号"
        rules={[{ required: true, message: '请输入业主编号' }]}
      />
      <ProFormText
        name="ownerName"
        label="业主姓名"
        rules={[{ required: true, message: '请输入业主姓名' }]}
      />
      <ProFormRadio.Group
        name="gender"
        label="性别"
        options={[
          { label: '未知', value: 0 },
          { label: '男', value: 1 },
          { label: '女', value: 2 },
        ]}
      />
      <ProFormText name="phone" label="手机号" />
      <ProFormText name="idCard" label="身份证号" />
      <ProFormText name="email" label="邮箱" />
      <ProFormText name="wechat" label="微信" />
      <ProFormTextArea name="address" label="联系地址" />
      <ProFormSelect
        name="ownerType"
        label="业主类型"
        options={Object.entries(ownerTypeMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormText name="emergencyContact" label="紧急联系人" />
      <ProFormText name="emergencyPhone" label="紧急联系电话" />
      <ProFormSelect
        name="status"
        label="状态"
        options={Object.entries(statusEnum).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const OwnerList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<OwnerType | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const statusEnum = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );
  const ownerTypeMap = useDict('owner_type', DICT_FALLBACKS.owner_type);
  const genderEnum = useDict('sys_user_sex', DICT_FALLBACKS.sys_user_sex);

  // 打开详情 Drawer：调详情接口（含 rooms + familyMembers）
  const openDetail = async (id: number) => {
    setDrawerOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const resp = (await getOwner(id)) as { data?: OwnerType };
      setDetail(resp?.data ?? null);
    } catch {
      message.error('加载业主详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const cols: ProColumns<OwnerType>[] = [
    { title: '业主编号', dataIndex: 'ownerCode', width: 130 },
    { title: '姓名', dataIndex: 'ownerName', width: 110 },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 80,
      valueEnum: genderEnum,
      search: false,
    },
    {
      title: '手机',
      dataIndex: 'phoneMask',
      width: 140,
      search: false,
    },
    {
      title: '业主类型',
      dataIndex: 'ownerType',
      width: 100,
      valueEnum: ownerTypeMap,
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
      width: 220,
      render: (_, record) => [
        <a key="detail" onClick={() => openDetail(record.id!)}>
          详情
        </a>,
        <OwnerForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该业主？"
          onConfirm={async () => {
            try {
              await deleteOwner(record.id!);
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
      <ProTable<OwnerType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listOwners({
            current: params.current,
            pageSize: params.pageSize,
            ownerCode: params.ownerCode,
            ownerName: params.ownerName,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <OwnerForm
            key="create"
            trigger={<Button type="primary">新建业主</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />

      <Drawer
        width={720}
        title="业主详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        {detailLoading ? (
          <div style={{ padding: 24 }}>加载中…</div>
        ) : detail ? (
          <>
            <ProDescriptions<OwnerType>
              column={2}
              dataSource={detail}
              columns={[
                { title: '业主编号', dataIndex: 'ownerCode' },
                { title: '姓名', dataIndex: 'ownerName' },
                {
                  title: '性别',
                  dataIndex: 'gender',
                  valueEnum: genderEnum,
                },
                { title: '手机', dataIndex: 'phoneMask' },
                { title: '身份证', dataIndex: 'idCardMask' },
                { title: '邮箱', dataIndex: 'email' },
                { title: '微信', dataIndex: 'wechat' },
                {
                  title: '业主类型',
                  dataIndex: 'ownerType',
                  valueEnum: ownerTypeMap,
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  valueEnum: statusEnum,
                },
                { title: '联系地址', dataIndex: 'address', span: 2 },
                { title: '紧急联系人', dataIndex: 'emergencyContact' },
                { title: '紧急联系电话', dataIndex: 'emergencyPhone' },
                { title: '备注', dataIndex: 'remark', span: 2 },
              ]}
            />

            <h4 style={{ marginTop: 24 }}>名下房间</h4>
            <ProTable
              rowKey="roomId"
              size="small"
              search={false}
              options={false}
              dataSource={detail.rooms ?? []}
              pagination={false}
              columns={[
                { title: '房间号', dataIndex: 'roomNo' },
                {
                  title: '关系',
                  dataIndex: 'relationType',
                  valueEnum: {
                    1: { text: '产权人' },
                    2: { text: '共有人' },
                    3: { text: '使用人' },
                  },
                },
              ]}
            />

            <h4 style={{ marginTop: 24 }}>家庭成员</h4>
            <ProTable
              rowKey="id"
              size="small"
              search={false}
              options={false}
              dataSource={detail.familyMembers ?? []}
              pagination={false}
              columns={[
                { title: '姓名', dataIndex: 'memberName' },
                { title: '关系', dataIndex: 'relation' },
                {
                  title: '性别',
                  dataIndex: 'gender',
                  valueEnum: genderEnum,
                },
                { title: '手机', dataIndex: 'phoneMask' },
              ]}
            />
          </>
        ) : (
          <div style={{ padding: 24, color: '#999' }}>暂无数据</div>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default OwnerList;
