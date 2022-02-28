import React, { useEffect, useContext } from 'react';
import { connect } from "react-redux";
import { Button, Form, Input, Divider, Alert } from "antd";
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { GoogleSVG, FacebookSVG } from 'assets/svg/icon';
import CustomIcon from 'components/util-components/CustomIcon'
import {
  showLoading,
  showAuthMessage,
  hideAuthMessage,
  authenticated
} from 'redux/actions/Auth';
//import JwtAuthService from 'services/JwtAuthService'
import { useHistory } from "react-router-dom";
import { motion } from "framer-motion"
import axios from 'axios'
import { API_BASE_URL, APP_PREFIX_PATH, AUTH_PREFIX_PATH } from 'configs/AppConfig'
import { UserContext } from 'contexts/UserContext';

export const LoginForm = (props) => {
  const { user, setUser } = useContext(UserContext)
  let history = useHistory();

  const {
    otherSignIn,
    showForgetPassword,
    hideAuthMessage,
    showLoading,
    extra,
    loading,
    showMessage,
    message,
    authenticated,
    showAuthMessage,
  } = props

  useEffect(() => {
    if (user) {
      if (user.admin) {
        history.push(APP_PREFIX_PATH + '/doctors')
      } else {
        history.push(APP_PREFIX_PATH + '/patients')
      }
    }
  }, [user, history])

  const onLogin = async (values) => {
    showLoading()
    try {
      const options = {
        url: API_BASE_URL + '/user/login',
        method: 'POST',
        data: values,
        headers: { 'Content-Type': 'application/json', }
      }
      const res = await axios.request(options)
      localStorage.setItem('jwt', res.data.jwt)
      setUser(res.data.user)
      authenticated()
    } catch (error) {
      console.log(error.response);
      if (error.response.data) showAuthMessage(error.response.data.message)
      setTimeout(() => {
        hideAuthMessage();
      }, 3000);
    }
  };

  const onForgetPasswordClick = () => {
    history.push(AUTH_PREFIX_PATH + '/forgot-password')
  }

  const renderOtherSignIn = (
    <div>
      <Divider>
        <span className="text-muted font-size-base font-weight-normal">or connect with</span>
      </Divider>
      <div className="d-flex justify-content-center">
        <Button
          onClick={() => { }}
          className="mr-2"
          disabled={loading}
          icon={<CustomIcon svg={GoogleSVG} />}
        >
          Google
        </Button>
        <Button
          onClick={() => { }}
          icon={<CustomIcon svg={FacebookSVG} />}
          disabled={loading}
        >
          Facebook
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <motion.div
        initial={{ opacity: 0, marginBottom: 0 }}
        animate={{
          opacity: showMessage ? 1 : 0,
          marginBottom: showMessage ? 20 : 0
        }}>
        <Alert type="error" showIcon message={message}></Alert>
      </motion.div>
      <Form
        layout="vertical"
        name="login-form"
        onFinish={onLogin}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              message: 'Please input your email',
            },
            {
              type: 'email',
              message: 'Please enter a validate email!'
            }
          ]}>
          <Input prefix={<MailOutlined className="text-primary" />} />
        </Form.Item>
        <Form.Item
          name="password"
          label={
            <div className={`${showForgetPassword ? 'd-flex justify-content-between w-100 align-items-center' : ''}`}>
              <span>Password</span>
              {
                showForgetPassword &&
                <span
                  onClick={onForgetPasswordClick}
                  className="cursor-pointer font-size-sm font-weight-normal text-muted"
                  style={{ marginLeft: '10px' }}
                >
                  Forget Password?
                </span>
              }
            </div>
          }
          rules={[
            {
              required: true,
              message: 'Please input your password',
            }
          ]}
        >
          <Input.Password prefix={<LockOutlined className="text-primary" />} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign In
          </Button>
        </Form.Item>
        {
          otherSignIn ? renderOtherSignIn : null
        }
        {extra}
      </Form>
    </>
  )
}

LoginForm.propTypes = {
  otherSignIn: PropTypes.bool,
  showForgetPassword: PropTypes.bool,
  extra: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
};

LoginForm.defaultProps = {
  otherSignIn: false,
  showForgetPassword: true
};

const mapStateToProps = ({ auth }) => {
  const { loading, message, showMessage, token, redirect } = auth;
  return { loading, message, showMessage, token, redirect }
}

const mapDispatchToProps = {
  showAuthMessage,
  showLoading,
  hideAuthMessage,
  authenticated
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)
