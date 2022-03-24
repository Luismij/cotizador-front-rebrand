import React, { useState, useContext } from 'react'
import { Input, Button, Card, message } from 'antd'
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import axios from 'axios'
import Loading from 'components/shared-components/Loading'
import { UserContext } from 'contexts/UserContext';
import { DeleteFilled } from '@ant-design/icons';

const EditDiscounts = ({ history }) => {
  const [loading, setLoading] = useState(false)
  const { user, setUser } = useContext(UserContext)
  const [discount, setDiscount] = useState(user.discount)

  const addRange = () => {
    let aux = { ...discount }
    aux.ranges.push({ min: 0, max: 0, discount: 0 })
    setDiscount({ ...discount })
  }

  const onChangeRange = (v, i) => {
    const num = Number(v.target.value);
    if ((Number.isInteger(num) && num > 0) || v.target.value === '') {
      let aux = { ...discount }
      aux.ranges[i][v.target.name] = num
      setDiscount(aux)
    }
  }

  const deleteRange = (i) => {
    let aux = { ...discount }
    aux.ranges.splice(i, 1)
    setDiscount(aux)
  }

  const edit = async () => {
    setLoading(true)
    try {
      const jwt = localStorage.getItem('jwt')
      const options = {
        method: 'PUT',
        data: discount,
        url: `${API_BASE_URL}/user/discount`,
        headers: {
          'Content-Type': 'application/json',
          'jwt-token': jwt
        }
      }
      const res = (await axios.request(options)).data
      message.success({ content: 'Editado exitosamente' })
      setUser(res)
      history.push(APP_PREFIX_PATH + '/discount')
    } catch (error) {
      message.error({ content: 'Hubo un error' })
    }
    setLoading(false)
  }

  if (loading) return (
    <Loading cover="content" />
  )

  return (
    <div style={{ flexDirection: 'column', display: 'flex' }}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '900' }}>Descuento fuera de rango:</p>
            <Input
              suffix='%'
              name='outOfRangeDiscount'
              value={discount.outOfRangeDiscount}
              placeholder='Descuento'
              style={{ width: 120 }}
              onChange={(v) => setDiscount({ ...discount, outOfRangeDiscount: v.target.value })} />
          </div>
          <Button onClick={() => history.push(APP_PREFIX_PATH + '/discount')} >
            Volver
          </Button>
        </div>
        {discount.ranges.map((range, i) => (
          <Card title={`Rango ${i + 1}`} key={`${i}`} style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
              <div style={{ display: 'flex', flexDirection: 'row', width: '280px', alignItems: 'center' }}>
                <p style={{ marginBottom: '0px', marginRight: '10px', fontWeight: '900' }}>Desde:</p>
                <Input value={range.min} name='min' placeholder='Desde' onChange={(v) => onChangeRange(v, i)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', width: '280px', alignItems: 'center' }}>
                <p style={{ marginBottom: '0px', marginRight: '10px', fontWeight: '900' }}>Hasta:</p>
                <Input value={range.max} name='max' placeholder='Hasta' onChange={(v) => onChangeRange(v, i)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', width: '280px', alignItems: 'center' }}>
                <p style={{ marginBottom: '0px', marginRight: '10px', fontWeight: '900' }}>Descuento:</p>
                <Input suffix='%' value={range.discount} name='discount' placeholder='Descuento' onChange={(v) => onChangeRange(v, i)} />
              </div>
            </div>
            <Button style={{ backgroundColor: '#ff7575', marginTop: '20px' }} onClick={() => deleteRange(i)}>
              <DeleteFilled style={{ color: 'white', fontSize: '20px' }} />
            </Button>
          </Card>
        ))
        }
        <Button onClick={addRange} style={{ marginTop: '10px', width: '100% ' }}>
          Agregar Rango
        </Button>
      </Card>
      <Button type='primary' onClick={edit} style={{ marginTop: '10px' }}>
        Editar
      </Button>
    </div>
  )
}

export default EditDiscounts
