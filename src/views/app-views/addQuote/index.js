import React, { useState, useEffect } from 'react'
import { Select, Card, Form, Button, Input, Modal, Descriptions } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import Loading from 'components/shared-components/Loading'
import axios from 'axios'

const { Option } = Select;

const onFinish = async (form, setLoading, history) => {
  setLoading(true)
  const jwt = localStorage.getItem('jwt')
  const data = new FormData()
  data.append('audio', form.dragger[0].originFileObj)

  try {
    const options = {
      url: `${API_BASE_URL}/voices/reference/`,
      method: 'POST',
      data,
      headers: {
        "Content-Type": "multipart/form-data",
        'jwt-token': jwt,
        referenceName: form.name,
        customerId: form.customer,
        type: 'reference'
      }
    }
    await axios.request(options)
    Modal.success({
      content: 'Audio uploaded successfully. The training has started, your voice will be ready to clone in two hours',
      onOk: () => { history.push(APP_PREFIX_PATH + '/voices') }
    })
  } catch (error) {
    Modal.error({ content: 'Something went wrong' })
    setLoading(false)
    console.error(error.response);
  }
}

const AddQuote = ({ history }) => {
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [markings, setMarkings] = useState([])
  const [productsToQuote, setProductsToQuote] = useState([{ product: null, amount: 1, marking: null, range: null, ink: null, inkIndex: 0, subtotal: 0, observations: '' }])

  useEffect(() => {
    const CancelToken = axios.CancelToken.source();
    const init = async () => {
      const jwt = localStorage.getItem('jwt')
      // Get the list of customers
      try {
        let options = {
          url: API_BASE_URL + '/customer/',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        let res = await axios.request(options)
        setCustomers(res.data)
      } catch (error) {
        console.error(error);
      }
      // Get the list of products
      try {
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
      } catch (error) {
        console.error(error);
      }
      // Get the list of markings
      try {
        let options = {
          url: API_BASE_URL + '/marking/',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        let res = await axios.request(options)
        setMarkings(res.data)
      } catch (error) {
        console.error(error);
      }
      setLoading(false)
    }
    init()
    return () => CancelToken.cancel('Cancelling in cleanup')
  }, [])

  const addProduct = () => setProductsToQuote([...productsToQuote, { product: null, amount: 1, marking: null, range: null, ink: null, inkIndex: 0, subtotal: 0, observations: '' }])

  const deleteProduct = (i) => {
    let aux = [...productsToQuote]
    aux.splice(i, 1)
    setProductsToQuote(aux)
  }

  const onChangeProduct = (j, i) => {
    let aux = [...productsToQuote]
    aux[i].product = products[j]
    let sum = 0
    if (aux[i].product && aux[i].product.price > 0) sum += (aux[i].product.price * aux[i].amount)
    if (aux[i].ink && aux[i].ink.price > 0) sum += (aux[i].ink.price * aux[i].amount)
    if (sum > 0) aux[i].subtotal = sum
    setProductsToQuote(aux)
  }

  const onChangeMarking = (j, i) => {
    let aux = [...productsToQuote]
    aux[i].marking = markings[j]
    setProductsToQuote(aux)
  }

  const onChangeRange = (j, i) => {
    let aux = [...productsToQuote]
    aux[i].range = aux[i].marking.ranges[j]
    if (aux[i].range.inks[aux[i].inkIndex]) aux[i].ink = aux[i].range.inks[aux[i].inkIndex]
    let sum = 0
    if (aux[i].product && aux[i].product.price > 0) sum += (aux[i].product.price * aux[i].amount)
    if (aux[i].ink && aux[i].ink.price > 0) sum += (aux[i].ink.price * aux[i].amount)
    if (sum > 0) aux[i].subtotal = sum
    setProductsToQuote(aux)
  }

  const onChangeInk = (j, i) => {
    let aux = [...productsToQuote]
    aux[i].ink = aux[i].range.inks[j]
    aux[i].inkIndex = j
    let sum = 0
    if (aux[i].product && aux[i].product.price > 0) sum += (aux[i].product.price * aux[i].amount)
    if (aux[i].ink && aux[i].ink.price > 0) sum += (aux[i].ink.price * aux[i].amount)
    if (sum > 0) aux[i].subtotal = sum
    setProductsToQuote(aux)
  }

  const onChangeHandler = (v, i) => {
    if (v.target.name === 'amount' && v.target.value <= 0) return
    if (v.target.name === 'subtotal' && v.target.value < 0) return
    let aux = [...productsToQuote]
    if (v.target.name === 'amount') {
      let sum = 0
      if (aux[i].product && aux[i].product.price > 0) sum = (aux[i].product.price * v.target.value)
      if (aux[i].ink && aux[i].ink.price > 0) sum += (aux[i].ink.price * v.target.value)
      if (sum > 0) aux[i].subtotal = sum
    }
    aux[i][v.target.name] = v.target.value
    setProductsToQuote(aux)
  }

  if (loading) return (
    <div>
      <Loading cover="content" />
    </div>
  )

  return (
    <div>
      <Card>
        <Form onFinish={(form) => onFinish(form, setLoading, history)}>
          <Form.Item label='Cliente' name={['customer']} rules={[{ required: true }]}>
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Selecciona un cliente"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {customers.map(p => (
                <Option value={p.id} key={p.id}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
          {productsToQuote.map((product, i) => (
            <Card key={i}>
              {product.product &&
                <Card>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Card style={{ marginRight: '20px' }}>
                      <img src={`https://catalogospromocionales.com/${product.product.photo}`} style={{ objectFit: 'contain', width: '200px' }} alt={product.product.description} />
                    </Card>
                    <Descriptions title='Informacion del producto' bordered>
                      <Descriptions.Item label='Descripcion'>{product.product.description}</Descriptions.Item>
                      <Descriptions.Item style={{ minWidth: '120px' }} label='Price'>{product.product.price}</Descriptions.Item>
                      <Descriptions.Item label='SKU'>{product.product.sku}</Descriptions.Item>
                    </Descriptions>
                  </div>
                </Card>
              }
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}>
                  <Form.Item style={{ marginRight: '15px' }} label='Producto' rules={[{ required: true }]}>
                    <Select
                      showSearch
                      style={{ width: 200 }}
                      onChange={(v) => onChangeProduct(v, i)}
                      placeholder="Selecciona una producto"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {products.map((p, j) => (
                        <Option value={j} key={p.id}>{p.description}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '24px' }}>
                    <Form.Item label='Marcacion' style={{ marginBottom: '0px' }} rules={[{ required: true }]}>
                      <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Selecciona una marcación"
                        onChange={(v) => onChangeMarking(v, i)}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {markings.map((p, j) => (
                          <Option value={j} key={p.id}>{p.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {product.marking &&
                      <Select
                        showSearch
                        style={{ width: 200, marginLeft: '8px' }}
                        placeholder="Selecciona un rango"
                        onChange={(j) => onChangeRange(j, i)}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {product.marking.ranges.map((r, j) => (
                          <Option value={j} key={r.id}>{`${r.min} - ${r.max}`}</Option>
                        ))}
                      </Select>
                    }
                    {product.range &&
                      <Select
                        showSearch
                        style={{ width: 200, marginLeft: '8px' }}
                        placeholder="Selecciona una tinta"
                        onChange={(j) => onChangeInk(j, i)}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {product.range.inks.map((r, j) => (
                          <Option value={j} key={r.id}>{`${r.name}`}</Option>
                        ))}
                      </Select>
                    }
                    {product.ink &&
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <h5 style={{ marginRight: '5px', marginBottom: '0px', marginLeft: '10px' }}>Precio por unidad:</h5>
                        <p style={{ marginRight: '5px', marginBottom: '0px' }}>{product.ink.price}</p>
                      </div>
                    }
                  </div>
                  <Form.Item label="Cantidad" style={{ width: 200, marginRight: '15px' }} rules={[{ required: true }]}>
                    <Input type='number' name='amount' value={product.amount} placeholder='Cantidad' onChange={(v) => onChangeHandler(v, i)} />
                  </Form.Item>
                  <Form.Item label="Subtotal" style={{ width: 200, marginRight: '15px' }} rules={[{ required: true }]}>
                    <Input type='number' name='subtotal' value={product.subtotal} placeholder='Precio' onChange={(v) => onChangeHandler(v, i)} />
                  </Form.Item>
                  <Form.Item label="Observaciones" style={{ width: 200, marginRight: '15px' }} rules={[{ required: true }]}>
                    <Input.TextArea style={{minWidth:'400px'}} name='observations' value={product.observations} placeholder='Observaciones' onChange={(v) => onChangeHandler(v, i)} />
                  </Form.Item>
                </div>
                <Button style={{ backgroundColor: '#ff7575' }} onClick={() => deleteProduct(i)}>
                  <DeleteFilled style={{ color: 'white', fontSize: '20px' }} />
                </Button>
              </div>
            </Card>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Button onClick={addProduct} style={{ fontSize: '25px', fontWeight: '900', height: '60px' }}>
              Agregar Producto
            </Button>
          </div>
          <Form.Item >
            <Button type="primary" htmlType="submit" style={{ marginTop: '15px' }}>
              Crear cotizacion
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default AddQuote
