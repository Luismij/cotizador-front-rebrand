import React, { useEffect, useState } from 'react'
import { Table, Input, Button, Popconfirm, message } from 'antd'
import axios from 'axios'
import Loading from 'components/shared-components/Loading'
import searchTextInArray from 'utils/search'
import antdTableSorter from 'utils/sort'
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

const Actions = (_id, deleteProduct, editProduct) => {
  return (
    <div>
      <EditOutlined onClick={() => editProduct(_id)} style={{ fontSize: '25px', marginRight: '15px' }} />
      <Popconfirm title="Sure to delete?" onConfirm={() => deleteProduct(_id)}>
        <DeleteOutlined style={{ fontSize: '25px' }} />
      </Popconfirm>
    </div>
  )
}

const Products = ({ history }) => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])

  useEffect(() => {
    const init = async () => {
      try {
        const jwt = localStorage.getItem('jwt')
        let options = {
          url: API_BASE_URL + '/product/',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        let res = await axios.request(options)
        setProducts(res.data)
        setAllProducts(res.data)
      } catch (error) {
        console.error(error);
      }
      setLoading(false)
    }
    init()
    /* return () => {
      cleanup
    } */
  }, [])

  const editProduct = async (_id) => {
    history.push(APP_PREFIX_PATH + '/editproduct/' + _id)
  }

  const deleteProduct = async (_id) => {
    setProducts(products.filter(p => p._id !== _id))
    try {
      const jwt = localStorage.getItem('jwt')
      const options = {
        url: API_BASE_URL + '/product/' + _id,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'jwt-token': jwt
        }
      }
      await axios.request(options)
      message.success({ content: 'Successfully deleted product', duration: 5 })
    } catch (error) {
      console.error(error);
    }
  }

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      sorter: (a, b) => antdTableSorter(a, b, 'sku'),
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => antdTableSorter(a, b, 'name'),
    },
    {
      title: 'Descripcion',
      dataIndex: 'description',
      key: 'description',
      render: (d) => <div dangerouslySetInnerHTML={{ __html: `<div>${d}</div>` }} />
    },
    {
      title: 'Perzonalizado',
      dataIndex: 'custom',
      key: 'custom',
      sorter: (a, b) => antdTableSorter(a, b, 'custom'),
      render: (d) => <div>{d ? 'si' : 'no'}</div>
    },
    {
      title: 'Acciones',
      dataIndex: '_id',
      key: '_id',
      render: (_id) => Actions(_id, deleteProduct, editProduct)
    }
  ]

  const search = (toSearch) => {
    if (toSearch.length > 0) {
      setProducts(searchTextInArray(allProducts, ['name', 'sku', 'description'], toSearch))
    } else {
      setProducts(allProducts)
    }
  }

  if (loading) return (
    <Loading cover="content" />
  )

  return (
    <div>
      <div style={{ flexDirection: 'row', display: 'flex', marginBottom: '20px' }}>
        <Input.Search allowClear placeholder="Search" onSearch={value => search(value)} style={{ marginRight: '4px' }} enterButton />
        <Button onClick={() => history.push(APP_PREFIX_PATH + '/addproduct')} style={{ marginBottom: '20px' }}>Agregar Producto</Button>
      </div>
      <Table
        columns={columns} dataSource={products} rowKey="_id"
      />
    </div>
  )
}

export default Products
