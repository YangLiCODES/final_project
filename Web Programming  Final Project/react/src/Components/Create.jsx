import React, { Component, useState } from "react";
import XLSX from "xlsx";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  TimePicker,
  Upload,
  Row,
  Col,
} from "antd";
import { UploadOutlined, PlusOutlined, LeftOutlined } from "@ant-design/icons";
import axios from "axios";
import { Link, withRouter } from "react-router-dom";
const { Option } = Select;
const _ = require("lodash");
const Create = (props) => {
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 8 },
  };

  const [form] = Form.useForm();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [xlsxFile, setXlsxFile] = useState(null);

  const imageChange = async ({ file }) => {
    setImage(await getBase64(file.originFileObj));
    setImageFile(file.originFileObj);
  };
  const xlsxUploadChange = ({ file }) => {
    setXlsxFile(file);
  };

  const formSubmit = () => {
    const formData = form.getFieldsValue();
    console.log(formData);

    if (!formData.xlsx) return;
    const reader = new FileReader();
    reader.readAsArrayBuffer(formData.xlsx.file.originFileObj);
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstWorksheet, { header: 1 });
      const [header, usersArr] = [
        jsonData[0].map((item) => _.camelCase(item)),
        jsonData.slice(1),
      ];
      const users = usersArr.map((user, index) => {
        const userObj = {};
        user.forEach((item, index) => {
          userObj[header[index]] = item;
        });
        userObj.checkIn = false;
        return userObj;
      });
      const formToSubmit = formatForm(formData);
      console.log(users);
      formToSubmit.append("users", JSON.stringify(users));
      axios({
        method: "post",
        url: "/events/add",
        data: formToSubmit,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((res) => {
          console.log(res);
          props.history.push(`/event/${formData.eventName}`);
        })
        .catch((err) => {
          console.log(err);
        });
    };
  };

  const formatForm = (formValues) => {
    const {
      eventName,
      year,
      semester,
      description,
      startDate,
      endDate,
      meetDay,
      startTime,
      endTime,
      image,
    } = formValues;

    const formData = new FormData();
    formData.append("eventName", eventName);
    year && formData.append("year", year);
    semester && formData.append("semester", semester);
    description && formData.append("description", description);
    startDate && formData.append("startDate", startDate.format("YYYY-MM-DD"));
    endDate && formData.append("endDate", endDate.format("YYYY-MM-DD"));
    meetDay && formData.append("meetDay", meetDay);
    startTime && formData.append("startTime", startTime.format("LTS"));
    endTime && formData.append("endTime", endTime.format("LTS"));
    image && formData.append("image", image.file.originFileObj);

    return formData;
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
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
          <h1>Create New Event</h1>
        </Col>
      </Row>
      <Form
        onSubmitCapture={formSubmit}
        form={form}
        {...layout}
        name="basic"
        initialValues={{
          remember: true,
        }}
      >
        <Form.Item
          label="Event Name"
          name="eventName"
          rules={[
            {
              required: true,
              message: "please input the event name",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Year" name="year">
          <Select>
            <Option value="2022">2022</Option>
            <Option value="2021">2021</Option>
            <Option value="2020">2020</Option>
            <Option value="2019">2019</Option>
            <Option value="2018">2018</Option>
          </Select>
        </Form.Item>
        <Form.Item name="semester" label="Semester">
          <Select>
            <Option value="spring">spring</Option>
            <Option value="fall">fall</Option>
            <Option value="summer">summer</Option>
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Event Description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Start Date" name="startDate">
          <DatePicker />
        </Form.Item>
        <Form.Item label="End Date" name="endDate">
          <DatePicker />
        </Form.Item>

        <Form.Item label="Start Time" name="startTime">
          <TimePicker />
        </Form.Item>
        <Form.Item label="End Time" name="endTime">
          <TimePicker />
        </Form.Item>
        {/* <Form.Item label="image" name="image">
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            onChange={imageChange}
          >
            {image ? <img width="100%" src={image}></img> : <PlusOutlined />}
          </Upload>
        </Form.Item> */}
        <Form.Item
          rules={[
            {
              required: true,
              message: "please upload an excel",
            },
          ]}
          label="xlsx/csv"
          name="xlsx"
        >
          <Upload
            multiple={false}
            showUploadList={false}
            onChange={xlsxUploadChange}
          >
            <Button>
              <UploadOutlined /> {xlsxFile ? xlsxFile.name : "Upload"}
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>{" "}
    </>
  );
};

export default withRouter(Create);
