import React, { useState, useEffect } from 'react'
import { Select, Card, Form, Button, Input, Modal, Divider } from 'antd';
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
  const [productsToQuote, setProductsToQuote] = useState([{ product: null, amount: 1, markings: [], subtotal: 0, observations: '' }])

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

  const addProduct = () => setProductsToQuote([...productsToQuote, { product: null, amount: 1, markings: [], subtotal: 0, observations: '' }])

  const deleteProduct = (i) => {
    let aux = [...productsToQuote]
    aux.splice(i, 1)
    setProductsToQuote(aux)
  }

  const onChangeProduct = (j, i) => {
    let aux = [...productsToQuote]
    aux[i].product = products[j]
    setProductsToQuote(aux)
  }

  const onChangeHandler = (v, i) => {
    if (v.target.name === 'amount' && v.target.value <= 0) return
    if (v.target.name === 'subtotal' && v.target.value < 0) return
    let aux = [...productsToQuote]
    if (v.target.name === 'amount') {
      const amount = v.target.value
      let sum = 0
      if (aux[i].product && aux[i].product.price > 0) sum = (aux[i].product.price * amount)
      for (const mark of aux[i].markings) {
        if (mark.ink) {
          let inRange = false
          for (const ran of mark.ink.ranges) {
            if (amount < ran.min) {
              sum += mark.ink.minTotalPrice
              inRange = true
              break
            }
            if (amount >= ran.min && amount <= ran.max) {
              sum += amount * ran.price
              inRange = true
              break
            }
          }
          if (!inRange) {
            sum += mark.ink.outOfRangePrice * amount
          }
        }
      }
      if (sum > 0) aux[i].subtotal = sum
    }
    aux[i][v.target.name] = v.target.value
    setProductsToQuote(aux)
  }

  const addMarking = (i) => {
    let aux = [...productsToQuote]
    aux[i].markings.push({ name: null, i: null, ink: null })
    setProductsToQuote(aux)
  }

  const onChangeMarking = (i, j, k) => {
    let aux = [...productsToQuote]
    aux[i].markings[j] = { name: markings[k].name, i: k, ink: null }
    setProductsToQuote(aux)
  }

  const onChangeInk = (i, j, k) => {
    let aux = [...productsToQuote]
    aux[i].markings[j].ink = markings[aux[i].markings[j].i].inks[k]
    setProductsToQuote(aux)
  }

  const deleteMarking = (i, j) => {
    let aux = [...productsToQuote]
    aux[i].markings.splice(j, 1)
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
                <Option value={p._id} key={p._id}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
          {productsToQuote.map((product, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
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
                      <Option value={j} key={`${i}-${p._id}`}>{p.sku}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Button style={{ backgroundColor: '#ff7575' }} onClick={() => deleteProduct(i)}>
                  <DeleteFilled style={{ color: 'white', fontSize: '20px' }} />
                </Button>
              </div>
              {product.product &&
                <>
                  <Card>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <Card style={{ marginRight: '20px' }}>
                        <img src={`https://catalogospromocionales.com/${product.product.photo}`} style={{ objectFit: 'contain', width: '200px' }} alt={product.product.description} />
                      </Card>
                      <div style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '900' }}>Descripcion:</p>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '300' }}>{product.product.description}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '900' }}>Precio:</p>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '300' }}>{product.product.price}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '900' }}>SKU:</p>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '300' }}>{product.product.sku}</p>
                        </div>
                        <Form.Item label="Cantidad" style={{ width: 200, marginRight: '15px', marginTop: '20px' }} rules={[{ required: true }]}>
                          <Input type='number' name='amount' value={product.amount} placeholder='Cantidad' onChange={(v) => onChangeHandler(v, i)} />
                        </Form.Item>
                        <Form.Item label="Observaciones" style={{ width: 200, marginRight: '15px' }} rules={[{ required: true }]}>
                          <Input.TextArea style={{ minWidth: '280px' }} name='observations' value={product.observations} placeholder='Observaciones' onChange={(v) => onChangeHandler(v, i)} />
                        </Form.Item>
                      </div>
                      <div style={{ width: '500px', display: 'flex', flexDirection: 'column' }}>
                        {product.markings.map((m, j) => (
                          <div key={`marking ${i}-${j}`}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Form.Item label='Marcacion' style={{ marginBottom: '0px' }} rules={[{ required: true }]}>
                                <Select
                                  showSearch
                                  style={{ width: 160 }}
                                  placeholder="Selecciona una marcación"
                                  onChange={(k) => onChangeMarking(i, j, k)}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  {markings.map((p, k) => (
                                    <Option value={k} key={`${i}-${j}-${p._id}`}>{p.name}</Option>
                                  ))}
                                </Select>
                              </Form.Item>
                              {m.name &&
                                <Form.Item label='Tintas' style={{ marginBottom: '0px' }} rules={[{ required: true }]}>
                                  <Select
                                    showSearch
                                    style={{ width: 160 }}
                                    placeholder="Tintas"
                                    onChange={(k) => onChangeInk(i, j, k)}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                  >
                                    {markings[m.i].inks.map((ink, k) => (
                                      <Option value={k} key={`ink ${i - j - k}`}>{`Tinta ${k + 1}`}</Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              }
                              <Button style={{ backgroundColor: '#ff7575' }} onClick={() => deleteMarking(i, j)}>
                                <DeleteFilled style={{ color: 'white', fontSize: '20px' }} />
                              </Button>
                            </div>
                            <Divider style={{ margin: '15px' }} />
                          </div>
                        ))}
                        <Button onClick={() => addMarking(i)}>
                          Agregar Marcación
                        </Button>
                      </div>
                      <Form.Item label="Subtotal" style={{ width: 200, marginRight: '15px' }} rules={[{ required: true }]}>
                        <Input type='number' name='subtotal' value={product.subtotal} placeholder='Precio' onChange={(v) => onChangeHandler(v, i)} />
                      </Form.Item>
                    </div>
                  </Card>
                </>
              }
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
      </Card >
    </div >
  )
}

export default AddQuote
