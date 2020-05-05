import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Switch,
  message,
  Row,
  Col,
  Card,
  Input,
  Space,
  Button,
  Modal,
  Radio,
  Checkbox,
} from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined, LeftOutlined } from "@ant-design/icons";
import XLSX from "xlsx";
const { Search } = Input;
const parse = require("csv-parse/lib/sync");
const _ = require("lodash");
const { convertArrayToCSV } = require("convert-array-to-csv");

class EventDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      eventInfo: {},
      searchText: "",
      searchedColumn: "",
      csvModalVisible: false,
      exportCheckIn: 0,
      exportColumnFilter: [
        "pantherId",
        "firstName",
        "lastName",
        "department",
        "level",
        "campus",
        "degree",
        "email",
        "college",
        "year",
        "checkIn",
      ],
      search: "",
    };
  }
  componentDidMount() {
    axios({
      url: `/events/get_event/${this.props.match.params.eventName}`,
      method: "get",
    })
      .then((res) => {
        this.setState({
          eventInfo: res.data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
    axios({
      url: `/users/get_users/${this.props.match.params.eventName}`,
      method: "get",
    })
      .then((res) => {
        this.setState({ users: res.data });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.handleSearch(selectedKeys, confirm, dataIndex)
          }
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => this.handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text) =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: "" });
  };

  onSwitch(value, record) {
    axios({
      url: "/users/update_checkIn",
      method: "post",
      data: {
        eventName: this.props.match.params.eventName,
        pantherId: record.pantherId,
        checkIn: value,
      },
      headers: {
        //'Content-Type':'application/x-www-form-urlencoded',
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          const { users } = this.state;
          const newUsers = users.map((item) => {
            if (item.pantherId === record.pantherId) {
              item.checkIn = value;
            }
            return item;
          });
          this.setState({
            users: newUsers,
          });
        }
      })
      .catch((err) => {
        message.error("Error Network:Fail to check In!");
      });
  }

  exportCheckInChange = (e) => {
    console.log("radio checked", e.target.value);
    this.setState({
      exportCheckIn: e.target.value,
    });
  };
  exportColumnFilterChange = (checkedValues) => {
    this.setState({
      exportColumnFilter: checkedValues,
    });
  };

  exportCsv = () => {
    const csv = this.generateCsv();

    const link = document.createElement("a");
    link.download = "users.csv";
    const blob = new Blob([csv], { type: "text/plain" });
    link.href = window.URL.createObjectURL(blob);
    link.click();
  };

  generateCsv = () => {
    const usersFiltered = this.state.users
      .map((user) => {
        return _.pick(user, this.state.exportColumnFilter);
      })
      .filter((item) => {
        const { exportCheckIn } = this.state;
        switch (exportCheckIn) {
          case 0: {
            return item.checkIn;
          }
          case 1: {
            return !item.checkIn;
          }
          default: {
            return true;
          }
        }
      });
    const csv = convertArrayToCSV(
      usersFiltered.map((item) => {
        item.checkIn = String(item.checkIn);
        return item;
      })
    );
    return csv;
  };

  exportXlsx = () => {
    const csv = this.generateCsv();
    console.log(csv);

    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
    });

    const worksheet = XLSX.utils.json_to_sheet(records);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, worksheet, "SheetJS");

    XLSX.writeFile(newWorkbook, "users.xlsx");
  };

  filterDataSource = () => {
    const search = _.lowerCase(this.state.search);
    console.log(search);

    const newDataSource = this.state.users.filter((item) => {
      if (String(item.pantherId).search(search) !== -1) {
        return true;
      } else if (_.lowerCase(item.firstName).search(search) !== -1) {
        return true;
      } else if (_.lowerCase(item.lastName).search(search) !== -1) {
        return true;
      } else {
        return false;
      }
    });
    console.log(newDataSource);

    return newDataSource;
  };

  searchUser = (value) => {
    this.setState({
      search: value,
    });
  };

  render() {
    const columns = [
      {
        title: "PantherID",
        dataIndex: "pantherId",
        key: "pantherId",
      },
      {
        title: "First Name",
        dataIndex: "firstName",
        key: "firstName",
      },
      {
        title: "Last Name",
        dataIndex: "lastName",
        key: "lastName",
      },
      {
        title: "Department",
        dataIndex: "department",
        key: "department",
      },
      {
        title: "Level",
        dataIndex: "level",
        key: "level",
      },
      {
        title: "Campus",
        dataIndex: "campus",
        key: "campus",
      },
      {
        title: "Degree",
        dataIndex: "degree",
        key: "degree",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "College",
        dataIndex: "college",
        key: "college",
      },
      {
        title: "Year",
        dataIndex: "year",
        key: "year",
      },
      {
        title: "Check In",
        dataIndex: "checkIn",
        key: "checkIn",
        render: (isChecked, record) => (
          <Switch
            checked={isChecked}
            onChange={(value) => this.onSwitch(value, record)}
          />
        ),
      },
    ];

    const {
      eventName,
      year,
      semester,
      description,
      startDate,
      endDate,
      // meetDay,
      startTime,
      endTime,
      image,
    } = this.state.eventInfo;
    const eventInfo = {
      eventName,
      year,
      semester,
      description,
      startDate,
      endDate,
      // meetDay,
      startTime,
      endTime,
      image,
    };

    return (
      <>
        <Row style={{ marginTop: 50 }} justify="start">
          <Col offset={3}>
            <Link to="/">
              <Button icon={<LeftOutlined />}>Home</Button>
            </Link>
          </Col>
        </Row>
        <Row style={{ marginTop: 50 }} justify="space-around">
          <Col>
            <h1>{`Event: ${this.state.eventInfo.eventName}`}</h1>
          </Col>
        </Row>
        <Row style={{ marginTop: 50, marginLeft: 100, marginRight: 100 }}>
          {Array.from(Object.entries(eventInfo))
            .filter((item) => {
              const [key, value] = item;
              return key !== "image";
            })
            .map((item) => {
              const [key, value] = item;
              return (
                <Col span={6}>
                  <Card title={key}>
                    <p>{value || "Not Specified"}</p>
                  </Card>
                </Col>
              );
            })}
        </Row>
        <Row style={{ marginTop: 50 }} justify="end">
          <Col pull={3}>
            <Search
              placeholder="input search text"
              onSearch={this.searchUser}
              style={{ width: 200 }}
            />
          </Col>
        </Row>

        <Row style={{ marginTop: 50 }} justify="space-around">
          <Col span={18}>
            {" "}
            <Table columns={columns} dataSource={this.filterDataSource()} />
          </Col>
        </Row>
        <Row style={{ marginTop: 50 }} justify="center">
          <Col>
            <Modal
              title="Export to CSV"
              visible={this.state.csvModalVisible}
              onOk={this.handleOk}
              onCancel={() => {
                this.setState({
                  csvModalVisible: false,
                });
              }}
              footer={[
                <Button
                  key="cancel"
                  onClick={() => {
                    this.setState({
                      csvModalVisible: false,
                    });
                  }}
                >
                  Cancel
                </Button>,
                <Button type="primary" onClick={this.exportCsv}>
                  Export CSV
                </Button>,
                <Button type="primary" onClick={this.exportXlsx}>
                  Export XLSX
                </Button>,
              ]}
            >
              <h3>Select the columns you want to export</h3>
              <Checkbox.Group
                options={columns.map((item) => item.dataIndex)}
                defaultValue={this.state.exportColumnFilter}
                onChange={this.exportColumnFilterChange}
              />
              <h3 style={{ marginTop: 30 }}>
                Select the checkIn status you want to export
              </h3>
              <Radio.Group
                onChange={this.exportCheckInChange}
                value={this.state.exportCheckIn}
              >
                <Radio value={0}>export checkIn users[graduate (b)]</Radio>
                <Radio value={1}>export non-checkIn users[graduate (c)]</Radio>
                <Radio value={2}>export all [graduate (a)]</Radio>
              </Radio.Group>
            </Modal>
            <Button
              style={{ marginBottom: 100 }}
              onClick={() => {
                this.setState({ csvModalVisible: true });
              }}
            >
              Completed check-in
            </Button>
          </Col>
        </Row>
      </>
    );
  }
}

export default withRouter(EventDetail);
