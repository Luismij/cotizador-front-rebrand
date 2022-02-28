import React, { useEffect, useState } from 'react'
import { Form, Input, InputNumber, Button, DatePicker, Card, message } from 'antd';
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import axios from 'axios'
import Loading from 'components/shared-components/Loading'
import moment from 'moment'

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
    .reduce((res, key) => (res[key] = obj[key], res), {})

const EditPatient = ({ history, match }) => {
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState(null)
  const patientId = match.params.patientid

  useEffect(() => {
    const init = async () => {
      try {
        const jwt = localStorage.getItem('jwt')
        const options = {
          url: API_BASE_URL + '/patients/patient/' + patientId,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        let res = await axios.request(options)
        if (res.data.birthday) res.data.birthday = moment(res.data.birthday, 'YYYY/MM/DD')
        setPatient(res.data)
        setLoading(false)
      } catch (error) {
        console.error(error);
      }
    }
    init()
  }, [patientId])

  const onFinish = async (form) => {
    let data = Object.filter(form, item => (item !== undefined && item !== ''))
    data._id = patientId
    data.sessionCounter = patient.sessionCounter
    if (data.birthday) data.birthday = moment(data.birthday).format('YYYY/MM/DD')
    const jwt = localStorage.getItem('jwt')
    try {
      const options = {
        url: API_BASE_URL + '/patients/',
        method: 'PUT',
        data,
        headers: {
          'Content-Type': 'application/json',
          'jwt-token': jwt
        }
      }
      await axios.request(options)
      message.success({ content: 'Successfully edited patient', duration: 5 })
      history.push(APP_PREFIX_PATH + '/patients')
    } catch (error) {
      message.error({ content: 'Something went wrong', duration: 4 })
      console.error(error);
    }
  }

  if (loading) return (
    <Loading cover="content" />
  )

  return (
    <Card>
      <Form {...layout} name="add-patient" onFinish={onFinish} validateMessages={validateMessages} initialValues={{ ...patient }}>
        <Form.Item name={['name']} label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['idNumber']} label="Id number" rules={[{ type: 'number' }]} >
          <InputNumber style={{ width: '200px' }} />
        </Form.Item>
        <Form.Item name={['email']} label="Email" rules={[{ type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['birthday']} label="birthday" >
          <DatePicker name={['birthday']} style={{ width: '200px' }} />
        </Form.Item>
        <Form.Item name={['telephone']} label="Telephone" >
          <InputNumber style={{ width: '200px' }} />
        </Form.Item>
        <Form.Item name={['address']} label="Address" >
          <Input />
        </Form.Item>
        <Form.Item name={['occupation']} label="Occupation" >
          <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit">
            Edit Patient
          </Button>
          <Button type="ghost" onClick={() => history.goBack()} style={{ marginLeft: '15px' }}>
            Back
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default EditPatient
