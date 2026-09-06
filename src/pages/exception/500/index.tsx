import { Link } from '@umijs/max';
import { Button, Card, Result } from 'antd';

export default () => (
  <Card variant="borderless">
    <Result
      status="500"
      title="500"
      subTitle="抱歉，服务器出了点问题。"
      extra={
        <Link to="/" prefetch>
          <Button type="primary">返回首页</Button>
        </Link>
      }
    />
  </Card>
);
