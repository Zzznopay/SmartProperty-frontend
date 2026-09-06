import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import React, { useRef } from 'react';
import { DICT_FALLBACKS } from '@/constants/dictFallbacks';
import { useDict } from '@/hooks/useDict';
import {
  getDeptTree,
  type SysDept,
} from '@/services/smart-property/system/dept';

// 部门管理：后端仅提供 /depts/tree 查询接口，增删改接口未实现，
// 故本页仅保留树查看，待后端补齐后再开放编辑能力。
const DeptList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const statusMap = useDict(
    'sys_normal_disable',
    DICT_FALLBACKS.sys_normal_disable,
  );

  const cols: ProColumns<SysDept>[] = [
    { title: '部门名称', dataIndex: 'deptName', width: 200 },
    { title: '负责人', dataIndex: 'leader', width: 120, search: false },
    { title: '联系电话', dataIndex: 'phone', width: 140, search: false },
    { title: '邮箱', dataIndex: 'email', width: 180, search: false },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      search: false,
      valueType: 'digit',
    },
    { title: '状态', dataIndex: 'status', width: 90, valueEnum: statusMap },
  ];

  return (
    <PageContainer>
      <ProTable<SysDept>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        pagination={false}
        expandable={{ defaultExpandAllRows: true }}
        request={async () => {
          const resp = await getDeptTree();
          const data =
            (resp as unknown as { data: { data: SysDept[] } }).data?.data ?? [];
          return { data, success: true } as never;
        }}
        search={false}
      />
    </PageContainer>
  );
};

export default DeptList;
