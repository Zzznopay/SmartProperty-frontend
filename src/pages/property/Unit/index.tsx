import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  type Building,
  listBuildings,
} from '@/services/smart-property/property/building';
import {
  addUnit,
  deleteUnit,
  listUnits,
  type Unit as UnitType,
  updateUnit,
} from '@/services/smart-property/property/unit';

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: UnitType;
  buildings: Building[];
};

const UnitForm: React.FC<FormProps> = ({
  trigger,
  reload,
  values,
  buildings,
}) => {
  const isEdit = !!values?.id;
  const statusEnum = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );

  return (
    <ModalForm<UnitType>
      title={isEdit ? '编辑单元' : '新建单元'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateUnit(values.id, vals);
          } else {
            await addUnit(vals);
          }
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormSelect
        name="buildingId"
        label="所属楼宇"
        rules={[{ required: true, message: '请选择楼宇' }]}
        options={buildings.map((b) => ({
          label: `${b.buildingName ?? ''} (${b.buildingCode ?? ''})`,
          value: b.id,
        }))}
        showSearch
      />
      <ProFormText
        name="unitCode"
        label="单元编号"
        rules={[{ required: true, message: '请输入单元编号' }]}
      />
      <ProFormText
        name="unitName"
        label="单元名称"
        rules={[{ required: true, message: '请输入单元名称' }]}
      />
      <ProFormDigit name="floorCount" label="层数" min={0} />
      <ProFormDigit name="sort" label="排序" min={0} />
      <ProFormSelect
        name="status"
        label="状态"
        options={Object.entries(statusEnum).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
        initialValue={1}
      />
    </ModalForm>
  );
};

const UnitList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const [buildings, setBuildings] = useState<Building[]>([]);

  const statusEnum = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );

  // 一次性拉所有楼宇，给 Modal 用（数量大时可换成远程 search）
  useEffect(() => {
    listBuildings({ pageSize: 9999 })
      .then((resp: unknown) => {
        const data =
          (resp as { data?: { data?: Building[] } })?.data?.data ?? [];
        setBuildings(data);
      })
      .catch(() => setBuildings([]));
  }, []);

  const cols: ProColumns<UnitType>[] = [
    {
      title: '所属楼宇',
      dataIndex: 'buildingId',
      width: 200,
      ellipsis: true,
      valueType: 'select',
      fieldProps: {
        options: buildings.map((b) => ({
          label: b.buildingName ?? '',
          value: b.id,
        })),
        showSearch: true,
      },
      render: (_, record) => record.buildingName ?? '-',
    },
    { title: '单元编号', dataIndex: 'unitCode', width: 140 },
    { title: '单元名称', dataIndex: 'unitName', width: 140 },
    {
      title: '层数',
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
        <UnitForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          buildings={buildings}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该单元？"
          onConfirm={async () => {
            try {
              await deleteUnit(record.id!);
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
      <ProTable<UnitType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listUnits({
            current: params.current,
            pageSize: params.pageSize,
            buildingId:
              typeof params.buildingId === 'string'
                ? Number(params.buildingId)
                : params.buildingId,
            unitCode: params.unitCode,
            unitName: params.unitName,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <UnitForm
            key="create"
            trigger={<Button type="primary">新建单元</Button>}
            buildings={buildings}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default UnitList;
