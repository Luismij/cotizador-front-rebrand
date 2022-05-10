import React, { useEffect, useRef, useState, useContext } from 'react'
import { Form, Input, InputNumber, Upload, Button, Card, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import axios from 'axios'
import Loading from 'components/shared-components/Loading'
import ColorPicker from 'components/shared-components/ColorPicker'
import { UserContext } from 'contexts/UserContext';

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

const uploadHandle = (info) => {
  if (info.fileList[1]) {
    return [info.fileList[1]]
  } else if (info.fileList[0]) {
    return [info.fileList[0]]
  } else return []
}

Object.filter = (obj, predicate) =>
  Object.keys(obj)
    .filter(key => predicate(obj[key]))// eslint-disable-next-line
    .reduce((res, key) => (res[key] = obj[key], res), {});

const EditUser = ({ history, match }) => {
  const { updateUser } = useContext(UserContext)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const form = useRef(null)

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
    let filterData = Object.filter(form, item => item !== undefined)
    for (const key in filterData) {
      if (filterData[key] === null) filterData[key] = ''
    }
    const jwt = localStorage.getItem('jwt')
    const data = new FormData()
    for (const key in filterData) {
      if (key !== 'logo' && key !== 'logo2') {
        const item = filterData[key];
        data.append(key, item)
      } else {
        data.append(key, form[key][0].originFileObj)
      }
    }
    try {
      const options = {
        url: API_BASE_URL + '/user/',
        method: 'PUT',
        data,
        headers: {
          'Content-Type': 'multipart/form-data',
          'jwt-token': jwt
        }
      }
      await axios.request(options)
      await updateUser()
      message.success({ content: 'Usuario editado con exito' })
      setLoading(false)
      history.push(APP_PREFIX_PATH + '/users')
    } catch (error) {
      setLoading(false)
      console.error(error);
    }
  }

  const setForm = (v, input) => {
    setUser({ ...user, [input]: v.hex })
    form.current.setFieldsValue({
      [input]: v.hex
    })
  }

  if (loading) return (
    <Loading cover="content" />
  )

  return (
    <Card>
      <Form {...layout} name="add-user" onFinish={onFinish} validateMessages={validateMessages} initialValues={{ ...user }} ref={form}>
        <Form.Item name={['name']} label="Nombre" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['email']} label="Correo" rules={[{ type: 'email', required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['logo']} label="Logo" valuePropName="logo" getValueFromEvent={uploadHandle} >
          <Upload.Dragger style={{ width: '300px' }} method='get' accept='image/*' name="logo" action="/upload.do" multiple={false} onChange={uploadHandle} onPreview>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text" style={{ color: 'black' }}>Haz click o arrastra tu logo a esta area</p>
          </Upload.Dragger>
        </Form.Item>
        <Form.Item name={['logo2']} label="Logo2" valuePropName="logo2" getValueFromEvent={uploadHandle} >
          <Upload.Dragger style={{ width: '300px' }} method='get' accept='image/*' name="logo2" action="/upload.do" multiple={false} onChange={uploadHandle} onPreview>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text" style={{ color: 'black' }}>Haz click o arrastra tu logo a esta area</p>
          </Upload.Dragger>
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
        <Form.Item name={['mainColor']} label="Color principal" >
          <ColorPicker colorChange={(v) => setForm(v, 'mainColor')} color={user.mainColor} />
        </Form.Item>
        <Form.Item name={['secondaryColor']} label="Color secundario" >
          <ColorPicker colorChange={(v) => setForm(v, 'secondaryColor')} color={user.secondaryColor} />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit">
            Guardar
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
