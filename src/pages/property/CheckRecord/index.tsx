import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDatePicker,
  ProFormSelect,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  addCheckRecord,
  type CheckRecord as CheckRecordType,
  completeCheck,
  listCheckRecords,
} from '@/services/smart-property/property/checkRecord';
import {
  listOwners,
  type Owner,
} from '@/services/smart-property/property/owner';
import { listRooms, type Room } from '@/services/smart-property/property/room';

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
  rooms: Room[];
  owners: Owner[];
};

const CheckRecordForm: React.FC<FormProps> = ({
  trigger,
  reload,
  rooms,
  owners,
}) => {
  const checkTypeMap = useDict('check_type', DICT_FALLBACKS.check_type);
  const checkResultMap = useDict('check_result', DICT_FALLBACKS.check_result);
  const checkStatusMap = useDict('check_status', DICT_FALLBACKS.check_status);

  return (
    <ModalForm<CheckRecordType>
      title="新建验房记录"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await addCheckRecord(vals);
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormSelect
        name="roomId"
        label="所属房间"
        rules={[{ required: true, message: '请选择房间' }]}
        options={rooms.map((r) => ({
          label: `${r.communityName ?? ''} ${r.buildingName ?? ''} ${r.roomNo ?? ''}`,
          value: r.id,
        }))}
        showSearch
      />
      <ProFormSelect
        name="ownerId"
        label="业主"
        options={owners.map((o) => ({
          label: `${o.ownerName} (${o.ownerCode})`,
          value: o.id,
        }))}
        showSearch
      />
      <ProFormSelect
        name="checkType"
        label="验房类型"
        options={Object.entries(checkTypeMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormDatePicker
        name="checkDate"
        label="验房日期"
        rules={[{ required: true, message: '请选择验房日期' }]}
      />
      <ProFormSelect
        name="checkResult"
        label="验房结果"
        options={Object.entries(checkResultMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormTextArea name="problems" label="问题描述" />
      <ProFormSelect
        name="status"
        label="状态"
        options={Object.entries(checkStatusMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const CheckRecordList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);

  const checkTypeMap = useDict('check_type', DICT_FALLBACKS.check_type);
  const checkResultMap = useDict('check_result', DICT_FALLBACKS.check_result);
  const checkStatusMap = useDict('check_status', DICT_FALLBACKS.check_status);

  useEffect(() => {
    listRooms({ pageSize: 9999 })
      .then((resp: unknown) => {
        const data = (resp as { data?: { data?: Room[] } })?.data?.data ?? [];
        setRooms(data);
      })
      .catch(() => setRooms([]));

    listOwners({ pageSize: 9999 })
      .then((resp: unknown) => {
        const data = (resp as { data?: { data?: Owner[] } })?.data?.data ?? [];
        setOwners(data);
      })
      .catch(() => setOwners([]));
  }, []);

  const cols: ProColumns<CheckRecordType>[] = [
    {
      title: '房间号',
      dataIndex: 'roomNo',
      width: 140,
      search: false,
      ellipsis: true,
    },
    {
      title: '业主',
      dataIndex: 'ownerName',
      width: 140,
      search: false,
      ellipsis: true,
    },
    {
      title: '验房类型',
      dataIndex: 'checkType',
      width: 110,
      valueEnum: checkTypeMap,
    },
    {
      title: '验房日期',
      dataIndex: 'checkDate',
      width: 130,
      valueType: 'date',
    },
    {
      title: '验房结果',
      dataIndex: 'checkResult',
      width: 110,
      valueEnum: checkResultMap,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: checkStatusMap,
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
        record.status !== 2 ? (
          <Popconfirm
            key="complete"
            title="确认该验房问题已整改完成？"
            onConfirm={async () => {
              try {
                await completeCheck(record.id!, {});
                message.success('操作成功');
                actionRef.current?.reload();
              } catch {
                message.error('操作失败');
              }
            }}
          >
            <a>整改完成</a>
          </Popconfirm>
        ) : (
          <span key="done" style={{ color: '#999' }}>
            已完成
          </span>
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<CheckRecordType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listCheckRecords({
            current: params.current,
            pageSize: params.pageSize,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <CheckRecordForm
            key="create"
            trigger={<Button type="primary">新建验房记录</Button>}
            rooms={rooms}
            owners={owners}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default CheckRecordList;
