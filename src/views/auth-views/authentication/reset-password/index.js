import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Form, Input, Button, message } from "antd";
import { LockOutlined } from '@ant-design/icons';
import axios from 'axios'
import { API_BASE_URL, AUTH_PREFIX_PATH } from 'configs/AppConfig'

const backgroundStyle = {
  backgroundImage: 'url(/img/others/img-17.jpg)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover'
}

const ForgotPassword = ({ history, match }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  const token = match.params.token

  useEffect(() => {
    const init = async () => {
      try {
        const options = {
          url: API_BASE_URL + '/auth/checkresetpasswordtoken',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'reset-password-token': token
          }
        }
        const res = (await axios.request(options)).data
        if (res) {
          setLoading(false)
        } else {
          history.push(AUTH_PREFIX_PATH + '/login')
          message.error("This URL has expired")
        }
      } catch (error) {
        console.log(error);
        history.push(AUTH_PREFIX_PATH + '/login')
        message.error("This URL has expired")
      }
    }
    init()// eslint-disable-next-line
  }, []);


  const onSend = async (values) => {
    setLoading(true)
    try {
      const options = {
        url: API_BASE_URL + '/auth/resetpassword2/',
        method: 'POST',
        data: { password: values.password },
        headers: {
          'Content-Type': 'application/json',
          'reset-password-token': token
        }
      }
      await axios.request(options)
      message.success('Password changed successfully');
      history.push(AUTH_PREFIX_PATH + '/login')
    } catch (error) {
      console.log(error);
      message.error(error.response.data.message)
    }
    setLoading(false)
  };

  return (
    <div className="h-100" style={backgroundStyle}>
      <div className="container d-flex flex-column justify-content-center h-100">
        <Row justify="center">
          <Col xs={20} sm={20} md={20} lg={9}>
            <Card>
              <div className="my-2">
                <div className="text-center">
                  <img className="img-fluid" src="/img/logo.png" alt="" />
                  <h3 className="mt-3 font-weight-bold">Reset Password</h3>
                  <p className="mb-4">Enter your new password</p>
                </div>
                <Row justify="center">
                  <Col xs={24} sm={24} md={20} lg={20}>
                    <Form form={form} layout="vertical" name="reset-password" onFinish={onSend}>
                      <Form.Item
                        name={["password"]}
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
                              if (!value || getFieldValue('password') === value) {
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
                      <Form.Item>
                        <Button loading={loading} type="primary" htmlType="submit" block>{loading ? 'Sending' : 'Send'}</Button>
                      </Form.Item>
                    </Form>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default ForgotPassword

