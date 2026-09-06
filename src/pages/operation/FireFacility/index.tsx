import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Popconfirm } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {
  type IdOption,
  useBuildingMap,
  useCommunityMap,
  useCommunityOptions,
} from '@/hooks/useOptions';
import {
  addFireFacility,
  checkFireFacility,
  deleteFireFacility,
  type FireFacility as FireFacilityType,
  listFireFacilitys,
} from '@/services/smart-property/operation/fireFacility';
import { listBuildings } from '@/services/smart-property/property/building';

const facilityTypeMap = {
  1: { text: '灭火器' },
  2: { text: '消防栓' },
  3: { text: '喷淋' },
  4: { text: '烟感' },
  5: { text: '应急灯' },
};
const statusMap = {
  1: { text: '正常', status: 'Success' },
  2: { text: '故障', status: 'Error' },
  3: { text: '维修中', status: 'Processing' },
  4: { text: '已过期', status: 'Warning' },
};

const CreateForm: React.FC<{
  trigger: React.ReactNode;
  reload?: () => void;
}> = ({ trigger, reload }) => {
  const communityOptions = useCommunityOptions();
  const [buildingOptions, setBuildingOptions] = useState<IdOption[]>([]);
  useEffect(() => {
    let alive = true;
    listBuildings({ current: 1, pageSize: 500 })
      .then((resp) => {
        if (!alive) return;
        const items = (resp?.data ?? []) as {
          id?: number;
          buildingName?: string;
          buildingCode?: string;
        }[];
        setBuildingOptions(
          items
            .filter((b) => b.id !== undefined && b.buildingName)
            .map((b) => ({
              label: `${b.buildingName}（${b.buildingCode ?? ''}）`,
              value: b.id as number,
            })),
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return (
    <ModalForm<FireFacilityType>
      title="新建消防设施"
      trigger={trigger as React.ReactElement<unknown>}
      onFinish={async (vals) => {
        try {
          await addFireFacility(vals);
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
      <ProFormSelect
        name="buildingId"
        label="所属楼宇"
        options={buildingOptions}
        showSearch
      />
      <ProFormText
        name="facilityName"
        label="设施名称"
        rules={[{ required: true, message: '请输入设施名称' }]}
      />
      <ProFormSelect
        name="facilityType"
        label="设施类型"
        options={[
          { label: '灭火器', value: 1 },
          { label: '消防栓', value: 2 },
          { label: '喷淋', value: 3 },
          { label: '烟感', value: 4 },
          { label: '应急灯', value: 5 },
        ]}
        rules={[{ required: true, message: '请选择设施类型' }]}
      />
      <ProFormText name="facilityNo" label="设施编号" />
      <ProFormText name="location" label="安装位置" />
      <ProFormDatePicker name="installDate" label="安装日期" />
      <ProFormDatePicker name="expireDate" label="过期日期" />
      <ProFormSelect
        name="status"
        label="状态"
        options={[
          { label: '正常', value: 1 },
          { label: '故障', value: 2 },
          { label: '维修中', value: 3 },
          { label: '已过期', value: 4 },
        ]}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" />
    </ModalForm>
  );
};

const FireFacilityList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const communityMap = useCommunityMap();
  const buildingMap = useBuildingMap();

  const cols: ProColumns<FireFacilityType>[] = [
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    {
      title: '所属楼宇',
      dataIndex: 'buildingId',
      width: 140,
      ellipsis: true,
      search: false,
      render: (_, record) => buildingMap[record.buildingId ?? -1] ?? '-',
    },
    {
      title: '设施名称',
      dataIndex: 'facilityName',
      width: 140,
      ellipsis: true,
    },
    {
      title: '设施类型',
      dataIndex: 'facilityType',
      width: 100,
      valueEnum: facilityTypeMap,
    },
    { title: '设施编号', dataIndex: 'facilityNo', width: 120, search: false },
    {
      title: '安装位置',
      dataIndex: 'location',
      width: 180,
      ellipsis: true,
      search: false,
    },
    {
      title: '安装日期',
      dataIndex: 'installDate',
      width: 120,
      search: false,
      valueType: 'date',
    },
    {
      title: '过期日期',
      dataIndex: 'expireDate',
      width: 120,
      search: false,
      valueType: 'date',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      search: false,
      valueEnum: statusMap,
    },
    {
      title: '下次检查日期',
      dataIndex: 'nextCheckDate',
      width: 120,
      search: false,
      valueType: 'date',
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
      width: 140,
      render: (_, record) => [
        <Popconfirm
          key="check"
          title="确认检查该消防设施？"
          onConfirm={async () => {
            try {
              await checkFireFacility(record.id!);
              message.success('检查成功');
              actionRef.current?.reload();
            } catch {
              message.error('操作失败');
            }
          }}
        >
          <a>检查</a>
        </Popconfirm>,
        <Popconfirm
          key="del"
          title="确认删除该消防设施？"
          onConfirm={async () => {
            try {
              await deleteFireFacility(record.id!);
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
      <ProTable<FireFacilityType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listFireFacilitys({
            current: params.current,
            pageSize: params.pageSize,
            communityId:
              typeof params.communityId === 'string'
                ? Number(params.communityId)
                : params.communityId,
            facilityType:
              typeof params.facilityType === 'string'
                ? Number(params.facilityType)
                : params.facilityType,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <CreateForm
            key="create"
            trigger={<Button type="primary">新建消防设施</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
    </PageContainer>
  );
};

export default FireFacilityList;
