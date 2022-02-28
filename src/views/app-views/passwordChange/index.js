import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd';
import { API_BASE_URL, APP_PREFIX_PATH } from 'configs/AppConfig'
import axios from 'axios'
import { LockOutlined } from '@ant-design/icons';
import Loading from 'components/shared-components/Loading'


const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!',
  },
  number: {// eslint-disable-next-line
    range: 'Must be between ${min} and ${max}',
  },
};

Object.filter = (obj, predicate) =>
  Object.keys(obj)
    .filter(key => predicate(obj[key]))// eslint-disable-next-line
    .reduce((res, key) => (res[key] = obj[key], res), {});

const FirstPasswordChange = ({ history }) => {
  const [loading, setLoading] = useState(false)

  const onFinish = async (form) => {
    setLoading(true)
    const data = Object.filter(form, item => item !== undefined)
    const jwt = localStorage.getItem('jwt')
    try {
      const options = {
        url: API_BASE_URL + '/user/passwordchange/',
        method: 'PATCH',
        data,
        headers: {
          'Content-Type': 'application/json',
          'jwt-token': jwt
        }
      }
      await axios.request(options)
      message.success({ content: 'Successful password change' })
      history.push(APP_PREFIX_PATH + '/patients')
    } catch (error) {
      message.error({ content: error.response.data.message })
      console.error(error);
    }
    setLoading(false)
  }

  if (loading) return (
    <Loading cover="content" />
  )

  return (
    <Card>
      <Form {...layout} name="Edit user password" onFinish={onFinish} validateMessages={validateMessages}>
        <Form.Item
          name={["password"]}
          label="Current Password"
          rules={[{
            required: true,
            message: 'Please input your password'
          }]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined className="text-primary" />} />
        </Form.Item>
        <Form.Item
          name={["newPassword"]}
          label="New Password"
          rules={[{
            required: true,
            message: 'Please input your new password'
          }]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined className="text-primary" />} />
        </Form.Item>
        <Form.Item
          name={["confirm"]}
          label="ConfirmPassword"
          rules={[
            {
              required: true,
              message: 'Please confirm your password!'
            },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('Passwords do not match!');
              },
            })
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined className="text-primary" />} />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit">
            Cambiar contraseña
          </Button>
        </Form.Item>
      </Form>
    </Card >
  )
}

export default FirstPasswordChange
