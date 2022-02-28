import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd';
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import { DeleteFilled } from '@ant-design/icons';
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

const AddMarking = ({ history }) => {
  const [markingName, setMarkingName] = useState('')
  const [ranges, setRanges] = useState([{ min: 0, max: 1, inks: [{ name: '', price: 0 }] }])

  const onFinish = async (form) => {
    const jwt = localStorage.getItem('jwt')

    const data = {
      name: markingName,
      ranges
    }
    try {
      const options = {
        url: API_BASE_URL + '/marking/',
        method: 'POST',
        data,
        headers: {
          'Content-Type': 'application/json',
          'jwt-token': jwt
        }
      }
      await axios.request(options)
      message.success({ content: 'Cliente creado con exito' })
      history.push(APP_PREFIX_PATH + '/markings')
    } catch (error) {
      console.error(error);
    }
  }

  const addRange = () => setRanges([...ranges, { min: 0, max: 1, inks: [{ name: '', price: 0 }] }])
  const addInk = (i) => {
    let aux = [...ranges]
    aux[i].inks.push({ name: '', price: 0 })
    setRanges(aux)
  }

  const onChangeRange = (v, i) => {
    let aux = [...ranges]
    aux[i][v.target.name] = v.target.value
    setRanges(aux)
  }

  const onChangeInk = (v, i, j) => {
    let aux = [...ranges]
    aux[i].inks[j][v.target.name] = v.target.value
    setRanges(aux)
  }

  const deleteRange = (i) => {
    let aux = [...ranges]
    aux.splice(i, 1)
    setRanges(aux)
  }

  const deleteInk = (i, j) => {
    let aux = [...ranges]
    aux[i].inks.splice(j, 1)
    setRanges(aux)
  }

  return (
    <Card title='Crear marcación'>
      <Form {...layout} name="add-marking" onFinish={onFinish} validateMessages={validateMessages}>
        <Form.Item label="Nombre" rules={[{ required: true }]}>
          <Input value={markingName} onChange={(v) => setMarkingName(v.target.value)} />
        </Form.Item>
        {ranges.map((range, i) => (
          <Card title={`Rango de unidades ${i + 1}`} key={`${i}`}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                <Form.Item label="Min" rules={[{ required: true }]}>
                  <Input type='number' value={range.min} name='min' placeholder='min' onChange={(v) => onChangeRange(v, i)} />
                </Form.Item>
                <Form.Item label="Max" rules={[{ required: true }]}>
                  <Input type='number' value={range.max} name='max' placeholder='max' onChange={(v) => onChangeRange(v, i)} />
                </Form.Item>
              </div>
              <Button style={{ backgroundColor: '#ff7575' }} onClick={() => deleteRange(i)}>
                <DeleteFilled style={{ color: 'white', fontSize: '20px' }} />
              </Button>
            </div>
            <div>
              {range.inks.map((ink, j) => (
                <Card title={`Tinta ${j + 1}`} key={`${i}-${j}`}>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Form.Item style={{ width: '500px' }} label="Nombre" rules={[{ required: true }]}>
                      <Input value={ink.name} name='name' placeholder='Nombre' onChange={(v) => onChangeInk(v, i, j)} />
                    </Form.Item>
                    <Form.Item style={{ width: '300px' }} label="Precio" rules={[{ required: true }]}>
                      <Input type='number' value={ink.price} name='price' placeholder='Precio' onChange={(v) => onChangeInk(v, i, j)} />
                    </Form.Item>
                  </div>
                  <Button style={{ backgroundColor: '#ff7575' }} onClick={() => deleteInk(i, j)}>
                    <DeleteFilled style={{ color: 'white', fontSize: '20px' }} />
                  </Button>
                </Card>
              ))
              }
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '15px' }}>
                <Button onClick={() => addInk(i)} style={{ fontSize: '25px', fontWeight: '900', height: '60px' }}>
                  Agregar Tinta
                </Button>
              </div>
            </div>
          </Card>
        ))
        }
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '15px' }}>
          <Button onClick={addRange} style={{ fontSize: '25px', fontWeight: '900', height: '60px' }}>
            Agregar rango
          </Button>
        </div>
        <Form.Item >
          <Button type="primary" htmlType="submit">
            Crear
          </Button>
          <Button type="ghost" onClick={() => history.push(APP_PREFIX_PATH + '/markings')} style={{ marginLeft: '15px' }}>
            Volver
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default AddMarking
