import {
  BankOutlined,
  CarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  FireOutlined,
  HomeOutlined,
  IdcardOutlined,
  NotificationOutlined,
  ScheduleOutlined,
  TeamOutlined,
  ToolOutlined,
  TransactionOutlined,
} from '@ant-design/icons';
import { Area, Column, Pie } from '@ant-design/plots';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row, Statistic } from 'antd';
import type { FC, ReactNode } from 'react';
import {
  getFeeStatus,
  getOperationOverview,
  getPaymentTrend,
  getPropertyOverview,
  getServiceOrderStatus,
  getServiceOrderTrend,
} from './service';

const ORDER_STATUS_LABEL: Record<number, string> = {
  1: '待分配',
  2: '处理中',
  3: '待回访',
  4: '已完成',
  5: '已关闭',
};
const FEE_STATUS_LABEL: Record<number, string> = {
  1: '未收',
  2: '部分收',
  3: '已收',
};

type Kpi = {
  title: string;
  value: number;
  icon: ReactNode;
  prefix?: string;
  precision?: number;
  color?: string;
};

const KpiCard: FC<Kpi> = ({ title, value, icon, prefix, precision, color }) => (
  <Card variant="borderless" styles={{ body: { padding: 20 } }}>
    <Statistic
      title={
        <span style={{ fontSize: 13 }}>
          {icon} {title}
        </span>
      }
      value={value}
      prefix={prefix}
      precision={precision}
      styles={{ content: { color: color || '#1677ff', fontWeight: 600 } }}
    />
  </Card>
);

const Home: FC = () => {
  const propOverview = useQuery({
    queryKey: ['home-prop-overview'],
    queryFn: getPropertyOverview,
  });
  const opOverview = useQuery({
    queryKey: ['home-op-overview'],
    queryFn: getOperationOverview,
  });
  const paymentTrend = useQuery({
    queryKey: ['home-payment-trend'],
    queryFn: () => getPaymentTrend(6),
  });
  const orderTrend = useQuery({
    queryKey: ['home-order-trend'],
    queryFn: () => getServiceOrderTrend(6),
  });
  const orderStatus = useQuery({
    queryKey: ['home-order-status'],
    queryFn: getServiceOrderStatus,
  });
  const feeStatus = useQuery({
    queryKey: ['home-fee-status'],
    queryFn: getFeeStatus,
  });

  const p = propOverview.data?.data;
  const o = opOverview.data?.data;
  const paymentData = paymentTrend.data?.data ?? [];
  const orderTrendData = orderTrend.data?.data ?? [];
  const orderStatusData = (orderStatus.data?.data ?? []).map((d) => ({
    label: ORDER_STATUS_LABEL[d.status] ?? `状态${d.status}`,
    value: d.count,
  }));
  const feeStatusData = (feeStatus.data?.data ?? []).map((d) => ({
    label: FEE_STATUS_LABEL[d.status] ?? `状态${d.status}`,
    value: d.count,
  }));

  const colProps = { xs: 12, sm: 12, md: 8, lg: 6, xl: 6 };

  return (
    <PageContainer title={false} breadcrumb={{}}>
      {/* 房产财务概览 */}
      <Card
        title="房产财务概览"
        loading={propOverview.isLoading}
        style={{ marginBottom: 16 }}
        variant="borderless"
      >
        <Row gutter={[16, 16]}>
          <Col {...colProps}>
            <KpiCard
              title="在管小区"
              value={p?.communityCount ?? 0}
              icon={<EnvironmentOutlined />}
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="楼栋数"
              value={p?.buildingCount ?? 0}
              icon={<BankOutlined />}
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="房间数"
              value={p?.roomCount ?? 0}
              icon={<HomeOutlined />}
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="业主数"
              value={p?.ownerCount ?? 0}
              icon={<TeamOutlined />}
              color="#52c41a"
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="车位数"
              value={p?.parkingSpaceCount ?? 0}
              icon={<CarOutlined />}
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="生效合同"
              value={p?.activeLeaseCount ?? 0}
              icon={<FileTextOutlined />}
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="本月收费"
              value={p?.monthPaymentAmount ?? 0}
              prefix="¥"
              precision={2}
              icon={<TransactionOutlined />}
              color="#fa8c16"
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="待缴费账单"
              value={p?.pendingLedgerCount ?? 0}
              icon={<ScheduleOutlined />}
              color="#cf1322"
            />
          </Col>
        </Row>
      </Card>

      {/* 运营管理概览 */}
      <Card
        title="运营管理概览"
        loading={opOverview.isLoading}
        style={{ marginBottom: 16 }}
        variant="borderless"
      >
        <Row gutter={[16, 16]}>
          <Col {...colProps}>
            <KpiCard
              title="工单总数"
              value={o?.serviceOrderCount ?? 0}
              icon={<ToolOutlined />}
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="待处理工单"
              value={o?.pendingServiceOrderCount ?? 0}
              icon={<ToolOutlined />}
              color="#cf1322"
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="今日来访"
              value={o?.todayVisitCount ?? 0}
              icon={<TeamOutlined />}
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="今日车辆"
              value={o?.todayVehicleCount ?? 0}
              icon={<CarOutlined />}
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="已发布公告"
              value={o?.noticeCount ?? 0}
              icon={<NotificationOutlined />}
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="社区活动"
              value={o?.communityActivityCount ?? 0}
              icon={<IdcardOutlined />}
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="清洁检查"
              value={o?.cleanCheckCount ?? 0}
              icon={<CheckCircleOutlined />}
              color="#52c41a"
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="消防巡查"
              value={o?.firePatrolCount ?? 0}
              icon={<FireOutlined />}
              color="#fa541c"
            />
          </Col>
          <Col {...colProps}>
            <KpiCard
              title="绿化检查"
              value={o?.greeneryCheckCount ?? 0}
              icon={<EnvironmentOutlined />}
              color="#52c41a"
            />
          </Col>
        </Row>
      </Card>

      {/* 数据分析图表 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card
            title="近 6 月收费趋势"
            variant="borderless"
            loading={paymentTrend.isLoading}
          >
            <Area
              height={300}
              data={paymentData}
              xField="month"
              yField="amount"
              shapeField="smooth"
              axis={{ x: { title: false }, y: { title: false } }}
              style={{ fillOpacity: 0.6 }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card
            title="近 6 月工单趋势"
            variant="borderless"
            loading={orderTrend.isLoading}
          >
            <Column
              height={300}
              data={orderTrendData}
              xField="month"
              yField="count"
              axis={{ x: { title: false }, y: { title: false } }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card
            title="工单状态分布"
            variant="borderless"
            loading={orderStatus.isLoading}
          >
            <Pie
              height={300}
              data={orderStatusData as any}
              angleField="value"
              colorField="label"
              radius={0.8}
              innerRadius={0.5}
              legend={{ position: 'right' }}
              label={{ text: 'value' }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card
            title="账单状态分布"
            variant="borderless"
            loading={feeStatus.isLoading}
          >
            <Pie
              height={300}
              data={feeStatusData as any}
              angleField="value"
              colorField="label"
              radius={0.8}
              innerRadius={0.5}
              legend={{ position: 'right' }}
              label={{ text: 'value' }}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Home;
