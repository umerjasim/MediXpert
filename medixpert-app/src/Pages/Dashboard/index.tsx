import { DollarOutlined } from "@ant-design/icons";
import { Card, Col, Row, Typography } from "antd";

function Dashboard() {
    const { Title, Text } = Typography;
    

    return (
        <>
            <Col
              key={'10'}
              xs={24}
              sm={24}
              md={12}
              lg={6}
              xl={6}
              className="mb-24"
            >
              <Card bordered={false} className="criclebox ">
                <div className="number">
                  <Row align="middle" gutter={[24, 0]}>
                    <Col xs={18}>
                      <span>Today’s Sales</span>
                      <Title level={3} style={{ marginTop: 10 }}>
                        $53.00 <small style={{ color: 'green' }}>+30%</small>
                      </Title>
                    </Col>
                    <Col xs={6}>
                      <div className="icon-box"><DollarOutlined /></div>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
        </>
    );
};

export default Dashboard;