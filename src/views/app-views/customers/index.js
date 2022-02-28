import React, { useEffect, useState } from 'react'
import { Table, Input, Button, Popconfirm, message } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import axios from 'axios'
import Loading from 'components/shared-components/Loading'
import searchTextInArray from 'utils/search'
import antdTableSorter from 'utils/sort'

const Actions = (id, deleteCustomer, editCustomer, selectCustomer) => {

  return (
    <div>
      <EyeOutlined onClick={() => selectCustomer(id)} style={{ fontSize: '25px', marginRight: '15px' }} />
      <EditOutlined onClick={() => editCustomer(id)} style={{ fontSize: '25px', marginRight: '15px' }} />
      <Popconfirm title="Sure to delete?" onConfirm={() => deleteCustomer(id)}>
        <DeleteOutlined style={{ fontSize: '25px' }} />
      </Popconfirm>
    </div>
  )
}
const Customers = ({ history }) => {
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [allCustomers, setAllCustomers] = useState([])

  useEffect(() => {
    const init = async () => {
      try {
        const jwt = localStorage.getItem('jwt')
        const options = {
          url: API_BASE_URL + '/customer/',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        const res = await axios.request(options)
        const aux = res.data.map(customer => ({ ...customer, key: customer.id }))
        setCustomers(aux)
        setAllCustomers(aux)
        setLoading(false)
      } catch (error) {
        console.error(error);
      }
    }
    init()
    /* return () => {
      cleanup
    } */
  }, [])

  const editCustomer = async (id) => {
    history.push(APP_PREFIX_PATH + '/editcustomer/' + id)
  }

  const deleteCustomer = async (id) => {
    setCustomers(customers.filter(p => p.id !== id))
    try {
      const jwt = localStorage.getItem('jwt')
      const options = {
        url: API_BASE_URL + '/customer/' + id,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'jwt-token': jwt
        }
      }
      await axios.request(options)
      message.success({ content: 'Successfully deleted customer', duration: 5 })
    } catch (error) {
      console.error(error);
    }
  }
  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => antdTableSorter(a, b, 'name'),
    },
    {
      title: 'Correo',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => antdTableSorter(a, b, 'email'),
    },
    {
      title: 'Telefono',
      dataIndex: 'phone',
      key: 'phone',
      sorter: (a, b) => antdTableSorter(a, b, 'email'),
    },
    {
      title: 'Acciones',
      dataIndex: 'id',
      key: 'id',
      render: (id) => Actions(id, deleteCustomer, editCustomer, selectCustomer)
    }
  ]

  const search = (toSearch) => {
    if (toSearch.length > 0) {
      setCustomers(searchTextInArray(allCustomers, ['name', 'email'], toSearch))
    } else {
      setCustomers(allCustomers)
    }
  }

  const selectCustomer = (id, index) => {
    history.push(APP_PREFIX_PATH + '/sessions/' + id)
  }

  if (loading) return (
    <Loading cover="content" />
  )

  return (
    <div>
      <div style={{ flexDirection: 'row', display: 'flex', marginBottom: '20px' }}>
        <Input.Search allowClear placeholder="Search" onSearch={value => search(value)} style={{ marginRight: '4px' }} enterButton />
        <Button onClick={() => history.push(APP_PREFIX_PATH + '/addcustomer')} style={{ marginBottom: '20px' }}>Crear cliente</Button>
      </div>
      <Table
        onRow={(record, rowIndex) => {
          return {
            onDoubleClick: () => { selectCustomer(record.id, rowIndex) }, // click row
          };
        }}
        columns={columns} dataSource={customers} rowKey="id"
      />
    </div>
  )
}

export default Customers
