import React, { useEffect, useState } from 'react'
import { Table, Input, Button, Popconfirm, message } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import axios from 'axios'
import Loading from 'components/shared-components/Loading'
import searchTextInArray from 'utils/search'
import antdTableSorter from 'utils/sort'

const Actions = (_id, deleteCustomer, editCustomer) => {

  return (
    <div>
      <EditOutlined onClick={() => editCustomer(_id)} style={{ fontSize: '25px', marginRight: '15px' }} />
      <Popconfirm title="Sure to delete?" onConfirm={() => deleteCustomer(_id)}>
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
        const aux = res.data.map(customer => ({ ...customer, key: customer._id }))
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

  const editCustomer = async (_id) => {
    history.push(APP_PREFIX_PATH + '/editcustomer/' + _id)
  }

  const deleteCustomer = async (_id) => {
    setCustomers(customers.filter(p => p._id !== _id))
    try {
      const jwt = localStorage.getItem('jwt')
      const options = {
        url: API_BASE_URL + '/customer/' + _id,
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
      dataIndex: '_id',
      key: '_id',
      render: (_id) => Actions(_id, deleteCustomer, editCustomer)
    }
  ]

  const search = (toSearch) => {
    if (toSearch.length > 0) {
      setCustomers(searchTextInArray(allCustomers, ['name', 'email'], toSearch))
    } else {
      setCustomers(allCustomers)
    }
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
            onDoubleClick: () => { editCustomer(record._id) }, // click row
          };
        }}
        columns={columns} dataSource={customers} rowKey="_id"
      />
    </div>
  )
}

export default Customers
