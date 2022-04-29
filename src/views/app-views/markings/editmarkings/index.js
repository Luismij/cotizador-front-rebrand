import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, message } from 'antd';
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import { DeleteFilled } from '@ant-design/icons';
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

const AddMarking = ({ history, match }) => {
  const [marking, setMarking] = useState({ name: '', inks: [{ name: '', minTotalPrice: '', outOfRangePrice: '', ranges: [{ min: '', max: '', price: '' }] }] })
  const [loading, setLoading] = useState(true)
  const markingId = match.params.markingId

  useEffect(() => {
    const init = async () => {
      const jwt = localStorage.getItem('jwt')
      try {
        const options = {
          url: API_BASE_URL + '/marking/' + markingId,
          method: 'GET',
          data: marking,
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        const res = (await axios.request(options)).data
        setMarking(res)
      } catch (error) {
        console.error(error);
      }
      setLoading(false)
    }
    init()// eslint-disable-next-line
  }, [])


  const onFinish = async () => {
    const jwt = localStorage.getItem('jwt')

    try {
      const options = {
        url: API_BASE_URL + '/marking/',
        method: 'PUT',
        data: marking,
        headers: {
          'Content-Type': 'application/json',
          'jwt-token': jwt
        }
      }
      await axios.request(options)
      message.success({ content: 'Marcación editada con exito' })
      history.push(APP_PREFIX_PATH + '/markings')
    } catch (error) {
      console.error(error);
    }
  }

  const addInk = () => {
    let aux = { ...marking }
    aux.inks.push({ name: '', minTotalPrice: 0, outOfRangePrice: 0, ranges: [{ min: 0, max: 0, price: 0 }] })
    setMarking(aux)
  }
  const addRange = (i) => {
    let aux = { ...marking }
    aux.inks[i].ranges.push({ min: 0, max: 0, price: 0 })
    setMarking(aux)
  }

  const onChangeInk = (v, i) => {
    if (v.target.name === 'name') {
      console.log(v.target.value);
      let aux = { ...marking }
      aux.inks[i][v.target.name] = v.target.value
      setMarking(aux)
    } else {
      const num = Number(v.target.value);
      if ((Number.isInteger(num) && num >= 0) || v.target.value === '') {
        let aux = { ...marking }
        aux.inks[i][v.target.name] = v.target.value
        setMarking(aux)
      }
    }
  }

  const deleteInk = (i) => {
    let aux = { ...marking }
    aux.inks.splice(i, 1)
    setMarking(aux)
  }

  const onChangeRange = (v, i, j) => {
    const num = Number(v.target.value);
    if ((Number.isInteger(num) && num > 0) || v.target.value === '') {
      let aux = { ...marking }
      aux.inks[i].ranges[j][v.target.name] = v.target.value
      setMarking(aux)
    }
  }

  const deleteRange = (i, j) => {
    let aux = { ...marking }
    aux.inks[i].ranges.splice(j, 1)
    setMarking(aux)
  }

  if (loading) return (
    <Loading cover="content" />
  )

  return (
    <Card title='Editar marcación'>
      <Form {...layout} name="add-marking" onFinish={onFinish} validateMessages={validateMessages}>
        <Form.Item label="Nombre" rules={[{ required: true }]}>
          <Input value={marking.name} onChange={(v) => setMarking({ ...marking, name: v.target.value })} />
        </Form.Item>
        {marking.inks.map((ink, i) => (
          <Card title={`Tinta ${i + 1}`} key={i}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', flexDirection: 'row', width: '280px', alignItems: 'center' }}>
                  <p style={{ marginBottom: '0px', marginRight: '10px', fontWeight: '900' }}>Nombre de tinta:</p>
                  <Input value={ink.name} name='name' placeholder='Nombre de tinta' onChange={(v) => onChangeInk(v, i)} style={{ width: '150px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', width: '280px', alignItems: 'center' }}>
                  <p style={{ marginBottom: '0px', marginRight: '10px', fontWeight: '900' }}>Precio minimo:</p>
                  <Input value={ink.minTotalPrice} name='minTotalPrice' placeholder='Precio minimo' onChange={(v) => onChangeInk(v, i)} style={{ width: '150px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', width: '280px', alignItems: 'center' }}>
                  <p style={{ marginBottom: '0px', marginRight: '10px', fontWeight: '900' }}>Precio unitario fuera de rango:</p>
                  <Input value={ink.outOfRangePrice} name='outOfRangePrice' placeholder='Precio unitario fuera de rango' onChange={(v) => onChangeInk(v, i)} />
                </div>
              </div>
              <Button style={{ backgroundColor: '#ff7575' }} onClick={() => deleteInk(i)}>
                <DeleteFilled style={{ color: 'white', fontSize: '20px' }} />
              </Button>
            </div>
            <div>
              {ink.ranges.map((range, j) => (
                <Card title={`Rango ${j + 1}`} key={`${i}-${j}`}>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '280px', alignItems: 'center' }}>
                      <p style={{ marginBottom: '0px', marginRight: '10px', fontWeight: '900' }}>Desde:</p>
                      <Input value={range.min} name='min' placeholder='Desde' onChange={(v) => onChangeRange(v, i, j)} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '280px', alignItems: 'center' }}>
                      <p style={{ marginBottom: '0px', marginRight: '10px', fontWeight: '900' }}>Hasta:</p>
                      <Input value={range.max} name='max' placeholder='Hasta' onChange={(v) => onChangeRange(v, i, j)} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '280px', alignItems: 'center' }}>
                      <p style={{ marginBottom: '0px', marginRight: '10px', fontWeight: '900' }}>Precio unitario:</p>
                      <Input value={range.price} name='price' placeholder='Precio' onChange={(v) => onChangeRange(v, i, j)} />
                    </div>
                  </div>
                  <Button style={{ backgroundColor: '#ff7575', marginTop: '20px' }} onClick={() => deleteRange(i, j)}>
                    <DeleteFilled style={{ color: 'white', fontSize: '20px' }} />
                  </Button>
                </Card>
              ))
              }
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '15px' }}>
                <Button onClick={() => addRange(i)} style={{ fontSize: '25px', fontWeight: '900', height: '60px' }}>
                  Agregar Rango
                </Button>
              </div>
            </div>
          </Card>
        ))
        }
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '15px' }}>
          <Button onClick={addInk} style={{ fontSize: '25px', fontWeight: '900', height: '60px' }}>
            Agregar Tinta
          </Button>
        </div>
        <Form.Item >
          <Button type="primary" htmlType="submit">
            Guardar
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
