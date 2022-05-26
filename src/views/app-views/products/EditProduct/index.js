import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd';
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import axios from 'axios'
import Loading from 'components/shared-components/Loading'
import { DeleteFilled } from '@ant-design/icons';

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

const EditProduct = ({ history, match }) => {
  const [product, setProduct] = useState(null)
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const productId = match.params.productid

  useEffect(() => {
    const init = async () => {
      try {
        const jwt = localStorage.getItem('jwt')
        const options = {
          url: API_BASE_URL + '/product/' + productId,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        let res = await axios.request(options)
        setProduct(res.data)
        setPrices(res.data.prices)
        setLoading(false)
      } catch (error) {
        console.log(error);
      }
    }
    init()
  }, [productId])


  const onFinish = async (form) => {
    //setLoading(true)
    let data = Object.filter(form, item => item !== undefined)
    data._id = productId
    data = { ...data, prices }
    data = { ...data, custom: product.custom ? true : false }
    const jwt = localStorage.getItem('jwt')
    try {
      const options = {
        url: API_BASE_URL + '/product/',
        method: 'PUT',
        data,
        headers: {
          'Content-Type': 'application/json',
          'jwt-token': jwt
        }
      }
      await axios.request(options)
      message.success({ content: 'Producto editado con exito' })
      setLoading(false)
      history.push(APP_PREFIX_PATH + '/products')
    } catch (error) {
      setLoading(false)
      console.error(error);
    }
  }

  const onchangePrice = (v, i) => {
    const value = v.target.value.toString().replace(/\$\s?|(,*)/g, '')
    if (!(value.match(/^\d+\.\d+$/) || value.match(/^\d+$/)) && value !== '') return
    if (value < 0) return
    let aux = [...prices]
    aux[i].price = value !== '' ? parseInt(value) : 0
    setPrices(aux)
  }

  const onchangePriceDescription = (v, i) => {
    let aux = [...prices]
    aux[i].description = v.target.value
    setPrices(aux)
  }

  const deletePrice = (i) => {
    let aux = [...prices]
    aux.splice(i, 1)
    setPrices(aux)
  }

  const addPrice = () => {
    setPrices([...prices, { price: 0, description: '' }])
  }

  if (loading) return (
    <Loading cover="content" />
  )

  return (
    <Card>
      <Form {...layout} name="add-product" onFinish={onFinish} validateMessages={validateMessages} initialValues={{ ...product }}>
        <Form.Item name={['sku']} label="SKU" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['name']} label="Nombre" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['resume']} label="Resumen" >
          <Input />
        </Form.Item>
        <Form.Item name={['keywords']} label="Palabras clave" >
          <Input />
        </Form.Item>
        <Form.Item name={['photo']} label="Foto URL" >
          <Input />
        </Form.Item>
        <Form.Item name={['description']} label="Descripción" >
          <Input.TextArea />
        </Form.Item>
        {prices.map((p, i) => (
          <Card key={`${i}`} title={`Precio ${i + 1}`}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <div style={{ width: '90%' }}>
                <Form.Item label='Precio' >
                  <Input value={p.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} onChange={(v) => onchangePrice(v, i)} />
                </Form.Item>
                <Form.Item label='Descripcion' >
                  <Input.TextArea value={p.description} onChange={(v) => onchangePriceDescription(v, i)} />
                </Form.Item>
              </div>
              <Button onClick={() => deletePrice(i)}>
                <DeleteFilled style={{ color: 'red' }} />
              </Button>
            </div>
          </Card>
        ))}
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button onClick={addPrice}>Agregar precio</Button>
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit">
            Guardar
          </Button>
          <Button type="ghost" onClick={() => history.push(APP_PREFIX_PATH + '/products')} style={{ marginLeft: '15px' }}>
            Volver
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default EditProduct
