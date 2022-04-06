import React, { useEffect, useState } from 'react'
import { Table, Input } from 'antd'
import { API_BASE_URL } from 'configs/AppConfig'
import axios from 'axios'
import Loading from 'components/shared-components/Loading'
import searchTextInArray from 'utils/search'
import antdTableSorter from 'utils/sort'

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
      </div>
      <Table
        columns={columns} dataSource={products} rowKey="_id"
      />
    </div>
  )
}

export default Products
