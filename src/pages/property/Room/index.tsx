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
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  type Building,
  listBuildings,
} from '@/services/smart-property/property/building';
import {
  type Community,
  listCommunitys,
} from '@/services/smart-property/property/community';
import {
  addRoom,
  deleteRoom,
  listRooms,
  type Room as RoomType,
  updateRoom,
} from '@/services/smart-property/property/room';
import { listUnits, type Unit } from '@/services/smart-property/property/unit';

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: RoomType;
  buildings: Building[];
  units: Unit[];
};

const RoomForm: React.FC<FormProps> = ({
  trigger,
  reload,
  values,
  buildings,
  units,
}) => {
  const isEdit = !!values?.id;
  const roomTypeMap = useDict('room_type', DICT_FALLBACKS.room_type);
  const decorationMap = useDict(
    'room_decoration',
    DICT_FALLBACKS.room_decoration,
  );
  const statusEnum = useDict('room_status', DICT_FALLBACKS.room_status);

  return (
    <ModalForm<RoomType>
      title={isEdit ? '编辑房间' : '新建房间'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      onFinish={async (vals) => {
        try {
          if (isEdit && values?.id) {
            await updateRoom(values.id, vals);
          } else {
            await addRoom(vals);
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
      <ProFormSelect
        name="unitId"
        label="所属单元"
        options={units.map((u) => ({
          label: `${u.unitName ?? ''} (${u.unitCode ?? ''})`,
          value: u.id,
        }))}
        showSearch
      />
      <ProFormText
        name="roomCode"
        label="房间编号"
        rules={[{ required: true, message: '请输入房间编号' }]}
      />
      <ProFormText
        name="roomNo"
        label="房间号"
        rules={[{ required: true, message: '请输入房间号' }]}
      />
      <ProFormDigit name="floor" label="所在楼层" min={-10} />
      <ProFormSelect
        name="roomType"
        label="房间类型"
        options={Object.entries(roomTypeMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormDigit
        name="buildArea"
        label="建筑面积(㎡)"
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormSelect
        name="decoration"
        label="装修情况"
        options={Object.entries(decorationMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
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

const RoomList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // 筛选区受控：选小区后楼宇下拉只显示该小区的楼宇
  const [filterCommunityId, setFilterCommunityId] = useState<
    number | undefined
  >();
  const filteredBuildings = useMemo(
    () =>
      filterCommunityId
        ? buildings.filter((b) => b.communityId === filterCommunityId)
        : buildings,
    [buildings, filterCommunityId],
  );

  const roomTypeMap = useDict('room_type', DICT_FALLBACKS.room_type);
  const decorationMap = useDict(
    'room_decoration',
    DICT_FALLBACKS.room_decoration,
  );
  const statusEnum = useDict('room_status', DICT_FALLBACKS.room_status);

  // 一次性拉小区 / 楼宇 / 单元，缓存到 state
  useEffect(() => {
    listCommunitys({ pageSize: 9999 })
      .then((resp: unknown) => {
        const data =
          (resp as { data?: { data?: Community[] } })?.data?.data ?? [];
        setCommunities(data);
      })
      .catch(() => setCommunities([]));

    listBuildings({ pageSize: 9999 })
      .then((resp: unknown) => {
        const data =
          (resp as { data?: { data?: Building[] } })?.data?.data ?? [];
        setBuildings(data);
      })
      .catch(() => setBuildings([]));

    listUnits({ pageSize: 9999 })
      .then((resp: unknown) => {
        const data = (resp as { data?: { data?: Unit[] } })?.data?.data ?? [];
        setUnits(data);
      })
      .catch(() => setUnits([]));
  }, []);

  const cols: ProColumns<RoomType>[] = [
    {
      title: '小区',
      dataIndex: 'communityName',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '楼宇',
      dataIndex: 'buildingName',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '单元',
      dataIndex: 'unitName',
      width: 120,
      ellipsis: true,
      search: false,
    },
    { title: '房间编号', dataIndex: 'roomCode', width: 130 },
    { title: '房间号', dataIndex: 'roomNo', width: 100 },
    {
      title: '楼层',
      dataIndex: 'floor',
      width: 80,
      search: false,
      valueType: 'digit',
    },
    {
      title: '建筑面积(㎡)',
      dataIndex: 'buildArea',
      width: 120,
      search: false,
      valueType: 'digit',
    },
    {
      title: '装修',
      dataIndex: 'decoration',
      width: 100,
      valueEnum: decorationMap,
      search: false,
    },
    {
      title: '房间类型',
      dataIndex: 'roomType',
      width: 100,
      valueEnum: roomTypeMap,
      search: false,
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
        <RoomForm
          key="edit"
          trigger={<a>编辑</a>}
          values={record}
          buildings={buildings}
          units={units}
          reload={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="del"
          title="确认删除该房间？"
          onConfirm={async () => {
            try {
              await deleteRoom(record.id!);
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

  // 筛选区：小区和楼宇下拉联动。后续可换成远程 search 接口。
  const queryFormItems: ProColumns<RoomType>[] = [
    {
      title: '小区',
      dataIndex: 'communityId',
      valueType: 'select',
      hideInTable: true,
      fieldProps: {
        options: communities.map((c) => ({
          label: c.communityName,
          value: c.id,
        })),
        showSearch: true,
        allowClear: true,
        onChange: (v: number | undefined) => setFilterCommunityId(v),
      },
    },
    {
      title: '楼宇',
      dataIndex: 'buildingId',
      valueType: 'select',
      hideInTable: true,
      fieldProps: {
        options: filteredBuildings.map((b) => ({
          label: `${b.buildingName ?? ''} (${b.buildingCode ?? ''})`,
          value: b.id,
        })),
        showSearch: true,
        allowClear: true,
        disabled: !filterCommunityId,
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<RoomType>
        actionRef={actionRef}
        rowKey="id"
        columns={[...queryFormItems, ...cols]}
        request={async (params) => {
          const resp = await listRooms({
            current: params.current,
            pageSize: params.pageSize,
            communityId:
              typeof params.communityId === 'string'
                ? Number(params.communityId)
                : params.communityId,
            buildingId:
              typeof params.buildingId === 'string'
                ? Number(params.buildingId)
                : params.buildingId,
            roomCode: params.roomCode,
            roomNo: params.roomNo,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <RoomForm
            key="create"
            trigger={<Button type="primary">新建房间</Button>}
            buildings={buildings}
            units={units}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default RoomList;
