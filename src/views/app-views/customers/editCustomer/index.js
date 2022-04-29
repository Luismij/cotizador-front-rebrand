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

const EditCustomer = ({ history, match }) => {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const customerId = match.params.customerid

  useEffect(() => {
    const init = async () => {
      try {
        const jwt = localStorage.getItem('jwt')
        const options = {
          url: API_BASE_URL + '/customer/' + customerId,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        let res = await axios.request(options)
        setCustomer(res.data)
        setLoading(false)
      } catch (error) {
        console.log(error);
      }
    }
    init()
  }, [customerId])


  const onFinish = async (form) => {
    setLoading(true)
    let data = Object.filter(form, item => item !== undefined)
    data._id = customerId
    const jwt = localStorage.getItem('jwt')
    try {
      const options = {
        url: API_BASE_URL + '/customer/',
        method: 'PUT',
        data,
        headers: {
          'Content-Type': 'application/json',
          'jwt-token': jwt
        }
      }
      await axios.request(options)
      message.success({ content: 'Cliente editado con exito' })
      setLoading(false)
      history.push(APP_PREFIX_PATH + '/customers')
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
      <Form {...layout} name="add-customer" onFinish={onFinish} validateMessages={validateMessages} initialValues={{ ...customer }}>
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
        <Form.Item name={['logo']} label="URL Logo" >
          <Input />
        </Form.Item>
        <Form.Item name={['address']} label="Ciudad" >
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
            Guardar
          </Button>
          <Button type="ghost" onClick={() => history.push(APP_PREFIX_PATH + '/customers')} style={{ marginLeft: '15px' }}>
            Volver
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default EditCustomer
