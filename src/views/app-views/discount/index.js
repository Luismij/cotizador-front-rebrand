import React, { useContext } from 'react'
import { Table, Button, Card } from 'antd'
import { APP_PREFIX_PATH } from 'configs/AppConfig'
import { UserContext } from 'contexts/UserContext';

const Discounts = ({ history }) => {
  const { user } = useContext(UserContext)
  const { discount } = user

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

  return (
    <div>
      <Card>
        <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flexDirection: 'row', display: 'flex' }}>
            <h4 style={{ marginRight: '10px' }}>Descuento fuera de rango: </h4>
            <p><b>{discount.outOfRangeDiscount}%</b></p>
          </div>
          <div style={{ flexDirection: 'row', display: 'flex'}}>
            <Button onClick={() => history.push(APP_PREFIX_PATH + '/editdiscount')} >Editar descuento</Button>
          </div>
        </div>
      </Card>
      <Table
        columns={columns}
        dataSource={discount.ranges}
        rowKey="_id"
      />
    </div>
  )
}

export default Discounts
