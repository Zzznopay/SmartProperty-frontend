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
import { App, Button, Modal } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  addDecoration,
  checkDecoration,
  completeDecoration,
  type Decoration as DecorationType,
  listDecorations,
  startDecoration,
} from '@/services/smart-property/property/decoration';
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

const DecorationForm: React.FC<FormProps> = ({
  trigger,
  reload,
  rooms,
  owners,
}) => {
  // 装修押金/状态业务上是 1/2/3
  const depositStatusMap = useDict(
    'deposit_status',
    DICT_FALLBACKS.deposit_status,
  );
  const decorationStatusMap = useDict(
    'decoration_status',
    DICT_FALLBACKS.decoration_status,
  );

  return (
    <ModalForm<DecorationType>
      title="新建装修申请"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await addDecoration(vals);
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
      <ProFormDatePicker
        name="applyDate"
        label="申请日期"
        rules={[{ required: true, message: '请选择申请日期' }]}
      />
      <ProFormText name="decorationCompany" label="装修公司" />
      <ProFormText name="contactName" label="负责人" />
      <ProFormText name="contactPhone" label="负责人电话" />
      <ProFormDigit
        name="deposit"
        label="押金(元)"
        min={0}
        fieldProps={{ precision: 2 }}
      />
      <ProFormSelect
        name="depositStatus"
        label="押金状态"
        options={Object.entries(depositStatusMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
        initialValue={1}
      />
      <ProFormSelect
        name="status"
        label="装修状态"
        options={Object.entries(decorationStatusMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const DecorationList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);

  const depositStatusMap = useDict(
    'deposit_status',
    DICT_FALLBACKS.deposit_status,
  );
  const decorationStatusMap = useDict(
    'decoration_status',
    DICT_FALLBACKS.decoration_status,
  );
  const checkResultMap = useDict('check_result', DICT_FALLBACKS.check_result);

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

  // 行内操作 Modal：收集日期/结果
  const openDateModal = (
    title: string,
    onOk: (date: string) => Promise<void>,
    okText: string,
  ) => {
    let pickedDate = '';
    Modal.confirm({
      title,
      okText,
      cancelText: '取消',
      content: (
        <div style={{ marginTop: 8 }}>
          <input
            type="date"
            style={{
              width: '100%',
              padding: '6px 11px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
            }}
            onChange={(e) => {
              pickedDate = e.target.value;
            }}
          />
        </div>
      ),
      onOk: async () => {
        if (!pickedDate) {
          message.warning('请选择日期');
          return Promise.reject();
        }
        await onOk(pickedDate);
      },
    });
  };

  const checkResultOptions = Object.entries(checkResultMap).map(
    ([value, v]) => ({
      value: Number(value) as 1 | 2,
      label: v.text,
    }),
  );

  const openCheckModal = (id: number) => {
    let result: 1 | 2 = 1;
    let remark = '';
    Modal.confirm({
      title: '验收装修',
      okText: '提交',
      cancelText: '取消',
      content: (
        <div style={{ marginTop: 8 }}>
          <div style={{ marginBottom: 8 }}>
            {checkResultOptions.map((o) => (
              <label key={o.value} style={{ marginRight: 12 }}>
                <input
                  type="radio"
                  name="checkResult"
                  defaultChecked={o.value === 1}
                  onChange={() => {
                    result = o.value;
                  }}
                />{' '}
                {o.label}
              </label>
            ))}
          </div>
          <textarea
            placeholder="验收备注"
            style={{
              width: '100%',
              minHeight: 80,
              padding: '6px 11px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
            }}
            onChange={(e) => {
              remark = e.target.value;
            }}
          />
        </div>
      ),
      onOk: async () => {
        try {
          await checkDecoration(id, { checkResult: result, remark });
          message.success('已提交验收');
          actionRef.current?.reload();
        } catch {
          message.error('操作失败');
        }
      },
    });
  };

  const cols: ProColumns<DecorationType>[] = [
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
      title: '申请日期',
      dataIndex: 'applyDate',
      width: 130,
      valueType: 'date',
    },
    {
      title: '装修公司',
      dataIndex: 'decorationCompany',
      width: 160,
      ellipsis: true,
    },
    {
      title: '押金状态',
      dataIndex: 'depositStatus',
      width: 110,
      valueEnum: depositStatusMap,
    },
    {
      title: '装修状态',
      dataIndex: 'status',
      width: 110,
      valueEnum: decorationStatusMap,
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
      width: 260,
      render: (_, record) => [
        <a
          key="start"
          onClick={() =>
            openDateModal(
              `为「${record.roomNo ?? ''}」设置开工日期`,
              async (d) => {
                try {
                  await startDecoration(record.id!, { startDate: d });
                  message.success('已开工');
                  actionRef.current?.reload();
                } catch {
                  message.error('操作失败');
                }
              },
              '开工',
            )
          }
        >
          开工
        </a>,
        <a
          key="complete"
          onClick={() =>
            openDateModal(
              `为「${record.roomNo ?? ''}」设置完工日期`,
              async (d) => {
                try {
                  await completeDecoration(record.id!, { endDate: d });
                  message.success('已完工');
                  actionRef.current?.reload();
                } catch {
                  message.error('操作失败');
                }
              },
              '完工',
            )
          }
        >
          完工
        </a>,
        <a key="check" onClick={() => openCheckModal(record.id!)}>
          验收
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<DecorationType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listDecorations({
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
          <DecorationForm
            key="create"
            trigger={<Button type="primary">新建装修申请</Button>}
            rooms={rooms}
            owners={owners}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default DecorationList;
