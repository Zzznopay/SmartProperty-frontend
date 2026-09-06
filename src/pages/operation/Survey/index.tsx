import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Drawer, Popconfirm, Spin } from 'antd';
import React, { useRef, useState } from 'react';
import { useCommunityMap } from '@/hooks/useOptions';
import {
  addSurvey,
  deleteSurvey,
  finishSurvey,
  getSurveyStatistics,
  listSurveys,
  type SurveyStatisticsVO,
  type Survey as SurveyType,
} from '@/services/smart-property/operation/survey';

const surveyTypeMap = {
  1: { text: '投票' },
  2: { text: '问卷' },
};
const isAnonymousMap = {
  0: { text: '否' },
  1: { text: '是' },
};
const isMultipleMap = {
  0: { text: '否' },
  1: { text: '是' },
};
const statusMap = {
  1: { text: '草稿', status: 'Default' },
  2: { text: '进行中', status: 'Processing' },
  3: { text: '已结束', status: 'Success' },
};

const CreateForm: React.FC<{
  trigger: React.ReactNode;
  reload?: () => void;
}> = ({ trigger, reload }) => (
  <ModalForm<SurveyType>
    title="新建投票调查"
    trigger={trigger as React.ReactElement<unknown>}
    onFinish={async (vals) => {
      try {
        await addSurvey(vals);
        reload?.();
        return true;
      } catch {
        return false;
      }
    }}
  >
    <ProFormText
      name="surveyTitle"
      label="调查标题"
      rules={[{ required: true, message: '请输入调查标题' }]}
    />
    <ProFormTextArea name="surveyDesc" label="调查描述" />
    <ProFormSelect
      name="surveyType"
      label="调查类型"
      options={[
        { label: '投票', value: 1 },
        { label: '问卷', value: 2 },
      ]}
      initialValue={1}
      rules={[{ required: true, message: '请选择调查类型' }]}
    />
    <ProFormDateTimePicker name="startTime" label="开始时间" />
    <ProFormDateTimePicker name="endTime" label="结束时间" />
    <ProFormSelect
      name="isAnonymous"
      label="是否匿名"
      options={[
        { label: '否', value: 0 },
        { label: '是', value: 1 },
      ]}
      initialValue={0}
    />
    <ProFormSelect
      name="isMultiple"
      label="是否多选"
      options={[
        { label: '否', value: 0 },
        { label: '是', value: 1 },
      ]}
      initialValue={0}
    />
    <ProFormDigit name="maxSelect" label="最多选择数" min={1} />
    <ProFormTextArea name="remark" label="备注" />
  </ModalForm>
);

const SurveyList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();
  const [statOpen, setStatOpen] = useState(false);
  const [statLoading, setStatLoading] = useState(false);
  const [statData, setStatData] = useState<SurveyStatisticsVO[]>([]);
  const [statTitle, setStatTitle] = useState('');
  const communityMap = useCommunityMap();

  const openStatistics = async (record: SurveyType) => {
    setStatTitle(record.surveyTitle ?? '');
    setStatData([]);
    setStatOpen(true);
    setStatLoading(true);
    try {
      const resp: any = await getSurveyStatistics(record.id!);
      setStatData(resp?.data ?? []);
    } catch {
      message.error('获取统计失败');
    } finally {
      setStatLoading(false);
    }
  };

  const cols: ProColumns<SurveyType>[] = [
    {
      title: '调查标题',
      dataIndex: 'surveyTitle',
      width: 200,
      ellipsis: true,
      search: false,
    },
    {
      title: '所属小区',
      dataIndex: 'communityId',
      width: 150,
      ellipsis: true,
      search: false,
      render: (_, record) => communityMap[record.communityId ?? -1] ?? '-',
    },
    {
      title: '类型',
      dataIndex: 'surveyType',
      width: 80,
      valueEnum: surveyTypeMap,
      search: false,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 170,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 170,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '匿名',
      dataIndex: 'isAnonymous',
      width: 80,
      valueEnum: isAnonymousMap,
      search: false,
    },
    {
      title: '多选',
      dataIndex: 'isMultiple',
      width: 80,
      valueEnum: isMultipleMap,
      search: false,
    },
    {
      title: '最多选择',
      dataIndex: 'maxSelect',
      width: 90,
      search: false,
      valueType: 'digit',
    },
    {
      title: '参与人数',
      dataIndex: 'participantCount',
      width: 90,
      search: false,
      valueType: 'digit',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: statusMap,
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
      render: (_, record) => {
        const actions: React.ReactNode[] = [];
        actions.push(
          <a key="stat" onClick={() => openStatistics(record)}>
            统计
          </a>,
        );
        if (record.status === 2) {
          actions.push(
            <Popconfirm
              key="finish"
              title="确认结束该调查？"
              onConfirm={async () => {
                try {
                  await finishSurvey(record.id!);
                  message.success('已结束');
                  actionRef.current?.reload();
                } catch {
                  message.error('操作失败');
                }
              }}
            >
              <a style={{ color: 'red' }}>结束</a>
            </Popconfirm>,
          );
        }
        actions.push(
          <Popconfirm
            key="del"
            title="确认删除该调查？"
            onConfirm={async () => {
              try {
                await deleteSurvey(record.id!);
                message.success('删除成功');
                actionRef.current?.reload();
              } catch {
                message.error('删除失败');
              }
            }}
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>,
        );
        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<SurveyType>
        actionRef={actionRef}
        rowKey="id"
        columns={cols}
        request={async (params) => {
          const resp = await listSurveys({
            current: params.current,
            pageSize: params.pageSize,
            communityId:
              typeof params.communityId === 'string'
                ? Number(params.communityId)
                : params.communityId,
            status:
              typeof params.status === 'string'
                ? Number(params.status)
                : params.status,
          });
          return resp as never;
        }}
        search={{ labelWidth: 100 }}
        toolBarRender={() => [
          <CreateForm
            key="create"
            trigger={<Button type="primary">新建调查</Button>}
            reload={() => actionRef.current?.reload()}
          />,
        ]}
      />
      <Drawer
        title={`投票统计${statTitle ? ` - ${statTitle}` : ''}`}
        open={statOpen}
        onClose={() => setStatOpen(false)}
        width={480}
      >
        <Spin spinning={statLoading}>
          {statData.length === 0 && !statLoading ? (
            <div style={{ textAlign: 'center', color: '#999' }}>
              暂无统计数据
            </div>
          ) : (
            statData.map((item) => (
              <div
                key={item.optionId}
                style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}
              >
                <div style={{ marginBottom: 4 }}>{item.optionContent}</div>
                <div style={{ color: '#666' }}>
                  票数：{item.voteCount ?? 0}　占比：{item.percentage ?? 0}%
                </div>
              </div>
            ))
          )}
        </Spin>
      </Drawer>
    </PageContainer>
  );
};

export default SurveyList;
