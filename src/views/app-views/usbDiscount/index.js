import React, { useEffect, useState } from 'react'
import { Table, Button, Card } from 'antd'
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import Loading from 'components/shared-components/Loading'
import axios from 'axios'

const UsbDiscounts = ({ history }) => {
  const [discount, setDiscount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController();
    const init = async () => {
      try {
        const jwt = localStorage.getItem('jwt')
        const options = {
          url: API_BASE_URL + '/usbdiscount/',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          },
          signal: controller.signal
        }
        const res = (await axios.request(options)).data
        setDiscount(res)
      } catch (error) {
        console.log(error);
      }
      setLoading(false)
    }
    init()
    return () => {
      controller.abort()
    }
  }, [])


  const columns = [
    {
      title: 'Rangos',
      children: [
        {
          title: 'Desde',
          dataIndex: 'min',
          key: 'min',
        },
        {
          title: 'Hasta',
          dataIndex: 'max',
          key: 'max',
        },
        {
          title: 'Descuento %',
          dataIndex: 'discount',
          key: 'discount',
          render: (v) => <div>{v}%</div>
        }
      ]
    },
  ]

  if (loading) return (
    <Loading cover="content" />
  )

  return (
    <div>
      <Card>
        <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flexDirection: 'row', display: 'flex' }}>
            <h4 style={{ marginRight: '10px' }}>Descuento fuera de rango: </h4>
            <p><b>{discount.outOfRangeDiscount}%</b></p>
          </div>
          <div style={{ flexDirection: 'row', display: 'flex' }}>
            <Button onClick={() => history.push(APP_PREFIX_PATH + '/editusbdiscount')} >Editar descuento USB</Button>
          </div>
        </div>
      </Card>
      <Table
        columns={columns}
        dataSource={discount ? discount.ranges : []}
        rowKey="_id"
      />
    </div>
  )
}

export default UsbDiscounts
