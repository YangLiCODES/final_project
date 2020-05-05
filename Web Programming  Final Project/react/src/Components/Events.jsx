import React, { Component } from "react";
import { Col, Row, Card, Button } from "antd";
import { Link } from "react-router-dom";

import axios from "axios";
const cover = require("../images/cover.png");
class Events extends Component {
  constructor(props) {
    super(props);
    this.state = { events: [] };
  }

  componentDidMount() {
    axios({
      url: "/events",
      method: "get",
    })
      .then((res) => {
        this.setState({
          events: res.data,
        });
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  render() {
    return (
      <>
        {" "}
        <Row gutter={16} justify="space-around" align="middle">
          {this.state.events.map((item) => (
            <Col style={{ marginBottom: 100 }} span={4}>
              <Link to={`/event/${item.eventName}`}>
                <Card
                  cover={
                    <div style={{ height: "200px", overflow: "hidden" }}>
                      <img width="100%" alt="event cover" src={cover} />
                    </div>
                  }
                  hoverable
                  title={item["eventName"]}
                >
                  <p> {item["description"] || "No Description"}</p>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
        <Link to="/create">
          <Button style={{ marginTop: 30 }}>Add a Event</Button>
        </Link>
      </>
    );
  }
}
export default Events;
