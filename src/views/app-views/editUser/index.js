import React, { useEffect, useState } from 'react'
import { Form, Input, InputNumber, Button, Card, message } from 'antd';
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import axios from 'axios'
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

const EditUser = ({ history, match }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const jwtToken = localStorage.getItem('jwt')
      try {
        if (jwtToken) {
          const options = {
            method: 'GET',
            url: API_BASE_URL + "/user/loginjwt",
            headers: { 'jwt-token': jwtToken }
          }
          const res = await axios.request(options)
          setUser(res.data)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.log(error);
        localStorage.removeItem('jwt')
      }
      setLoading(false)
    }
    init()
  }, [])


  const onFinish = async (form) => {
    setLoading(true)
    let data = Object.filter(form, item => item !== undefined)
    const jwt = localStorage.getItem('jwt')
    try {
      const options = {
        url: API_BASE_URL + '/user/',
        method: 'PUT',
        data,
        headers: {
          'Content-Type': 'application/json',
          'jwt-token': jwt
        }
      }
      await axios.request(options)
      message.success({ content: 'Usuario editado con exito' })
      setLoading(false)
      history.push(APP_PREFIX_PATH + '/users')
    } catch (error) {
      setLoading(false)
      console.error(error);
    }
  }

  if (loading) return (
    <Loading cover="content" />
  )

  return (
    <Card>
      <Form {...layout} name="add-user" onFinish={onFinish} validateMessages={validateMessages} initialValues={{ ...user }}>
        <Form.Item name={['name']} label="Nombre" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['email']} label="Correo" rules={[{ type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['phone']} label="Telefono" >
          <InputNumber style={{ width: '200px' }} />
        </Form.Item>
        <Form.Item name={['webAddress']} label="Direccion web" >
          <Input />
        </Form.Item>
        <Form.Item name={['address']} label="Direccion" >
          <Input />
        </Form.Item>
        <Form.Item name={['businessName']} label="Razon social" >
          <Input />
        </Form.Item>
        <Form.Item name={['nit']} label="NIT" >
          <InputNumber style={{ width: '200px' }} />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit">
            Editar
          </Button>
          <Button type="ghost" onClick={() => history.push(APP_PREFIX_PATH + '/users')} style={{ marginLeft: '15px' }}>
            Volver
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default EditUser
