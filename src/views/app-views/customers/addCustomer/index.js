import React from 'react'
import { Form, Input, InputNumber, Button, Card, message } from 'antd';
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import axios from 'axios'


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

const AddCustomer = ({ history }) => {

  const onFinish = async (form) => {
    let data = Object.filter(form, item => item !== undefined)
    const jwt = localStorage.getItem('jwt')
    try {
      const options = {
        url: API_BASE_URL + '/customer/',
        method: 'POST',
        data,
        headers: {
          'Content-Type': 'application/json',
          'jwt-token': jwt
        }
      }
      await axios.request(options)
      message.success({ content: 'Cliente creado con exito' })
      history.push(APP_PREFIX_PATH + '/customers')
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Card>
      <Form {...layout} name="add-customer" onFinish={onFinish} validateMessages={validateMessages}>
        <Form.Item name={['businessName']} label="Razon social" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['name']} label="Contacto" >
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
        <Form.Item name={['logo']} label="URL Logo" >
          <Input />
        </Form.Item>
        <Form.Item name={['address']} label="Ciudad" >
          <Input />
        </Form.Item>
        <Form.Item name={['nit']} label="NIT" >
          <Input style={{ width: '200px' }} />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit">
            Crear
          </Button>
          <Button type="ghost" onClick={() => history.push(APP_PREFIX_PATH + '/customers')} style={{ marginLeft: '15px' }}>
            Volver
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default AddCustomer
