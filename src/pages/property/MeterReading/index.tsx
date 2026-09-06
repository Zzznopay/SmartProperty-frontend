import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button } from 'antd';
import dayjs from 'dayjs';
import React, { useRef } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import { useRoomOptions } from '@/hooks/useOptions';
import {
  addMeterReading,
  listMeterReadings,
  type MeterReading as MeterReadingType,
} from '@/services/smart-property/property/meterReading';

type FormProps = {
  trigger: React.ReactNode;
  reload?: () => void;
};

const ReadingForm: React.FC<FormProps> = ({ trigger, reload }) => {
  const meterTypeMap = useDict('meter_type', DICT_FALLBACKS.meter_type);
  const roomOptions = useRoomOptions();

  return (
    <ModalForm<MeterReadingType>
      title="新增抄表"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          const last = Number(vals.lastReading ?? 0);
          const cur = Number(vals.currentReading ?? 0);
          await addMeterReading({
            roomId: vals.roomId ? Number(vals.roomId) : undefined,
            meterType: Number(vals.meterType) as 1 | 2 | 3,
            meterNo: vals.meterNo,
            readingMonth: vals.readingMonth
              ? dayjs(vals.readingMonth as string).format('YYYY-MM')
              : undefined,
            lastReading: last,
            currentReading: cur,
            usageAmount: cur - last,
            readingDate: vals.readingDate
              ? dayjs(vals.readingDate as string).format('YYYY-MM-DD')
              : undefined,
            readingUser: vals.readingUser,
          });
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormSelect
        name="roomId"
        label="房间"
        options={roomOptions}
        showSearch
        rules={[{ required: true, message: '请选择房间' }]}
      />
      <ProFormSelect
        name="meterType"
        label="表类型"
        rules={[{ required: true, message: '请选择表类型' }]}
        options={Object.entries(meterTypeMap).map(([value, v]) => ({
          label: v.text,
          value: Number(value),
        }))}
      />
      <ProFormText name="meterNo" label="表编号" />
      <ProFormDatePicker
        name="readingMonth"
        label="抄表月份"
        picker="month"
        rules={[{ required: true, message: '请选择抄表月份' }]}
      />
      <ProFormDigit
        name="lastReading"
        label="上次读数"
        min={0}
        rules={[{ required: true, message: '请输入上次读数' }]}
      />
      <ProFormDigit
        name="currentReading"
        label="本次读数"
        min={0}
        rules={[{ required: true, message: '请输入本次读数' }]}
      />
      <ProFormDigit
        name="usageAmount"
        label="用量（自动计算）"
        min={0}
        readonly
      />
      <ProFormDatePicker
        name="readingDate"
        label="抄表日期"
        rules={[{ required: true, message: '请选择抄表日期' }]}
      />
      <ProFormText name="readingUser" label="抄表人" />
    </ModalForm>
  );
};

const MeterReadingList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const meterTypeMap = useDict('meter_type', DICT_FALLBACKS.meter_type);

  const cols: ProColumns<MeterReadingType>[] = [
    { title: '房号', dataIndex: 'roomNo', width: 140 },
    {
      title: '表类型',
      dataIndex: 'meterType',
      width: 100,
      valueEnum: meterTypeMap,
    },
    { title: '表编号', dataIndex: 'meterNo', width: 140 },
    {
      title: '抄表月份',
      dataIndex: 'readingMonth',
      width: 120,
      valueType: 'dateMonth',
    },
    {
      title: '上次读数',
      dataIndex: 'lastReading',
      width: 100,
      search: false,
      valueType: 'digit',
    },
    {
      title: '本次读数',
      dataIndex: 'currentReading',
      width: 100,
      search: false,
      valueType: 'digit',
    },
    {
      title: '用量',
      dataIndex: 'usageAmount',
      width: 100,
      search: false,
      valueType: 'digit',
    },
    {
      title: '抄表日期',
      dataIndex: 'readingDate',
      width: 120,
      valueType: 'date',
    },
  ];

  return (
    <PageContainer>
      <ProTable<MeterReadingType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          try {
            const resp = await listMeterReadings({
              current: params.current,
              pageSize: params.pageSize,
              roomNo: params.roomNo,
              meterNo: params.meterNo,
              meterType:
                typeof params.meterType === 'string'
                  ? Number(params.meterType)
                  : params.meterType,
              readingMonth: params.readingMonth,
              readingDate: params.readingDate,
            });
            return resp as never;
          } catch {
            message.error('加载失败');
            return { data: [], success: false, total: 0 };
          }
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <ReadingForm
            key="create"
            trigger={<Button type="primary">新增抄表</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default MeterReadingList;
