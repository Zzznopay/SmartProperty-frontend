import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  addBuilding,
  type Building as BuildingType,
  deleteBuilding,
  listBuildings,
  updateBuilding,
} from '@/services/smart-property/property/building';
import {
  type Community,
  listCommunitys,
} from '@/services/smart-property/property/community';

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: BuildingType;
  communities: Community[];
};

const BuildingForm: React.FC<FormProps> = ({
  trigger,
  reload,
  values,
  communities,
}) => {
  const isEdit = !!values?.id;
  const buildingTypeMap = useDict(
    'building_type',
    DICT_FALLBACKS.building_type,
  );
  const statusEnum = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );

  return (
    <ModalForm<BuildingType>
      title={isEdit ? '编辑楼宇' : '新建楼宇'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateBuilding(values.id, vals);
          } else {
            await addBuilding(vals);
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
        rules={[{ required: true, message: '请选择小区' }]}
        options={communities.map((c) => ({
          label: c.communityName,
          value: c.id,
        }))}
      />
      <ProFormText
        name="buildingCode"
        label="楼宇编号"
        rules={[{ required: true, message: '请输入楼宇编号' }]}
      />
      <ProFormText
        name="buildingName"
        label="楼宇名称"
        rules={[{ required: true, message: '请输入楼宇名称' }]}
      />
      <ProFormSelect
        name="buildingType"
        label="楼宇类型"
        options={Object.entries(buildingTypeMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormDigit name="floorCount" label="总层数" min={0} />
      <ProFormDigit
        name="area"
        label="建筑面积(㎡)"
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormDigit name="buildYear" label="建成年份" min={1900} max={2100} />
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

const BuildingList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const [communities, setCommunities] = useState<Community[]>([]);

  const buildingTypeMap = useDict(
    'building_type',
    DICT_FALLBACKS.building_type,
  );
  const statusEnum = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );

  // 一次性拉所有小区，给 Modal Select 用（搜索筛选另发请求）
  useEffect(() => {
    listCommunitys({ pageSize: 9999 })
      .then((resp: unknown) => {
        const data =
          (resp as { data?: { data?: Community[] } })?.data?.data ?? [];
        setCommunities(data);
      })
      .catch(() => setCommunities([]));
  }, []);

  const cols: ProColumns<BuildingType>[] = [
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 180,
      ellipsis: true,
      valueType: 'select',
      fieldProps: {
        options: communities.map((c) => ({
          label: c.communityName,
          value: c.id,
        })),
        showSearch: true,
      },
      render: (_, record) => record.communityName ?? '-',
    },
    { title: '楼宇编号', dataIndex: 'buildingCode', width: 140 },
    { title: '楼宇名称', dataIndex: 'buildingName', width: 140 },
    {
      title: '楼宇类型',
      dataIndex: 'buildingType',
      width: 100,
      valueEnum: buildingTypeMap,
    },
    {
      title: '总层数',
      dataIndex: 'floorCount',
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
      title: '操作',
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        <BuildingForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          communities={communities}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该楼宇？"
          onConfirm={async () => {
            try {
              await deleteBuilding(record.id!);
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
      <ProTable<BuildingType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listBuildings({
            current: params.current,
            pageSize: params.pageSize,
            communityId:
              typeof params.communityId === 'string'
                ? Number(params.communityId)
                : params.communityId,
            buildingCode: params.buildingCode,
            buildingName: params.buildingName,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <BuildingForm
            key="create"
            trigger={<Button type="primary">新建楼宇</Button>}
            communities={communities}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default BuildingList;
