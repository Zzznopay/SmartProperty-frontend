import {
  type ActionType,
  DrawerForm,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import React, { useRef, useState } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  listDictData,
  listDictTypes,
  type SysDictData,
  type SysDictType,
} from '@/services/smart-property/system/dict';

// 字典管理：后端仅提供 list 接口（listDictTypes / listDictData），
// 增删改接口未实现，故本页仅保留查看，待后端补齐后再开放编辑能力。
const DictList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const dataActionRef = useRef<ActionType | null>(null);
  const statusMap = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );
  const [currentType, setCurrentType] = useState<SysDictType | null>(null);

  const typeCols: ProColumns<SysDictType>[] = [
    { title: '字典ID', dataIndex: 'id', width: 80, search: false },
    { title: '字典名称', dataIndex: 'dictName', width: 180 },
    { title: '字典类型', dataIndex: 'dictType', width: 180 },
    { title: '状态', dataIndex: 'status', width: 90, valueEnum: statusMap },
    { title: '备注', dataIndex: 'remark', width: 200, search: false },
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
      width: 120,
      render: (_, record) => [
        <a key="view" onClick={() => setCurrentType(record)}>
          字典数据
        </a>,
      ],
    },
  ];

  const dataCols: ProColumns<SysDictData>[] = [
    { title: '字典标签', dataIndex: 'dictLabel', width: 160 },
    { title: '字典键值', dataIndex: 'dictValue', width: 140 },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      search: false,
      valueType: 'digit',
    },
    { title: '状态', dataIndex: 'status', width: 90, valueEnum: statusMap },
    { title: '备注', dataIndex: 'remark', width: 200, search: false },
  ];

  return (
    <PageContainer>
      <ProTable<SysDictType>
        actionRef={actionRef}
        rowKey="id"
        columns={typeCols}
        request={async (params) => {
          const resp = await listDictTypes({
            current: params.current,
            pageSize: params.pageSize,
            dictName: params.dictName,
            dictType: params.dictType,
          });
          return resp as never;
        }}
        search={{ labelWidth: 80 }}
      />
      <DrawerForm<SysDictData>
        title={`字典数据 - ${currentType?.dictName ?? ''}`}
        open={!!currentType}
        onOpenChange={(open) => {
          if (!open) setCurrentType(null);
        }}
        trigger={<span style={{ display: 'none' }} />}
        submitter={false}
        width={900}
      >
        <ProTable<SysDictData>
          actionRef={dataActionRef}
          rowKey="id"
          columns={dataCols}
          search={false}
          pagination={{ pageSize: 10 }}
          request={async () => {
            if (!currentType) return { data: [], success: true } as never;
            const resp = await listDictData(currentType.dictType);
            const data =
              (resp as unknown as { data: { data: SysDictData[] } }).data
                ?.data ?? [];
            return { data, success: true } as never;
          }}
        />
      </DrawerForm>
    </PageContainer>
  );
};

export default DictList;
