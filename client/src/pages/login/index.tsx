import { Button, Checkbox, Form, Input } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import profileStore from '../../module/profile/store';
import { register, login } from '../../module/profile/apis';

import 'antd/es/form/style/css';
import 'antd/es/input/style/css';
import 'antd/es/button/style/css';

const LoginRegister: React.FC = () => {
  const [form] = Form.useForm();
  let location = useLocation();
  let navigate = useNavigate();

  const state = location.state as { from?: { pathname?: string } };
  const from = state?.from?.pathname || '/profile';

  const onFinish = async (values: any) => {
    const res = await login(values);
    console.log('Success:', res);
    if (res.access_token) {
      localStorage.setItem('access_token', res.access_token);
      await profileStore.queryUser();
      navigate(from, { replace: true });
    }
  };

  const registerUser = async () => {
    console.log('re');
    try {
      const status = await form.validateFields();
      console.log(status);
      if (status) {
        const values = await form.getFieldsValue();
        const res = await register(values);
        if (res) {
          onFinish(values);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      form={form}
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="Username"
        name="name"
        rules={[{ required: true, message: 'Please input your username!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="remember"
        valuePropName="checked"
        wrapperCol={{ offset: 8, span: 16 }}
      >
        <Checkbox>Remember me</Checkbox>
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
        <Button htmlType="button" onClick={registerUser}>
          Register
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginRegister;
