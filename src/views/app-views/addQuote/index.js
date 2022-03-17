import React, { useState, useEffect } from 'react'
import { Select, Card, Form, Button, Input, Modal, Divider, Checkbox } from 'antd';
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
  const [productsToQuote, setProductsToQuote] = useState([{ product: null, price: 0, typeOfPrice: 'net', netPrice: 0, priceDescription: '', amount: 0, freight: 0, profit: 0, markings: [{ markingPrice: 0, unitPrice: 0, totalPrice: 0, name: null, ink: null, i: null }], discount: false, observations: '' }])

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

  const calculatePrices = (product) => {
    switch (product.typeOfPrice) {
      case 'net':
        product.netPrice = product.price
        break;
      case 'offer':
        product.netPrice = (product.price * 0.6) * 0.85
        break;
      case 'full':
        product.netPrice = product.price * 0.6
        break;
      default:
        break;
    }
    product.markings.forEach((mark, j) => {
      let sum = 0
      if (mark.ink) {
        let inRange = false
        for (const ran of mark.ink.ranges) {
          if (product.amount < ran.min) {
            sum += mark.ink.minTotalPrice
            inRange = true
            break
          }
          if (product.amount >= ran.min && product.amount <= ran.max) {
            sum += product.amount * ran.price
            inRange = true
            break
          }
        }
        if (!inRange) {
          sum += mark.ink.outOfRangePrice * product.amount
        }
      }
      if (sum > 0) {
        product.markings[j].markingPrice = sum / product.amount
      } else product.markings[j].markingPrice = 0
      product.markings[j].unitPrice = (parseFloat(product.netPrice) + parseFloat(product.markings[j].markingPrice) + parseFloat(product.freight)) / (product.profit > 0 ? ((100 - product.profit) / 100) : 1)
      product.markings[j].totalPrice = product.markings[j].unitPrice * product.amount
    });
    return product
  }

  const addProduct = () => setProductsToQuote([...productsToQuote, { product: null, price: 0, typeOfPrice: 'net', netPrice: 0, priceDescription: '', markings: [{ amount: 0, markingPrice: 0, freight: 0, unitPrice: 0, profit: 0, totalPrice: 0, name: null, ink: null, i: null }], discount: false, observations: '' }])

  const deleteProduct = (i) => {
    let aux = [...productsToQuote]
    aux.splice(i, 1)
    setProductsToQuote(aux)
  }

  const onChangeProduct = (j, i) => {
    let aux = [...productsToQuote]
    aux[i].product = products[j]
    if (aux[i].product.prices[0]) {
      aux[i].price = aux[i].product.prices[0].price
      aux[i].priceDescription = aux[i].product.prices[0].description
    }
    aux[i] = calculatePrices(aux[i])
    setProductsToQuote(aux)
  }

  const onChangeHandler = (v, i) => {
    const value = v.target.value.toString().replace(/\$\s?|(,*)/g, '')
    if (!value.match(/^-?\d+$/) && value !== '') return
    if (value < 0) return
    let aux = [...productsToQuote]
    aux[i][v.target.name] = value !== '' ? parseInt(value) : 0
    aux[i] = calculatePrices(aux[i])
    setProductsToQuote(aux)
  }

  const onChangeHandlerMark = (v, i, j) => {
    const value = v.target.value.toString().replace(/\$\s?|(,*)/g, '')
    if (!value.match(/^\d+\.\d+$/) && value !== '') return
    if (value < 0) return
    let aux = [...productsToQuote]
    aux[i].markings[j][v.target.name] = value !== '' ? parseFloat(value).toFixed(2) : 0
    if (v.target.name !== 'totalPrice') aux[i] = calculatePrices(aux[i])
    setProductsToQuote(aux)
  }

  const addMarking = (i) => {
    let aux = [...productsToQuote]
    aux[i].markings.push({ amount: 0, markingPrice: 0, freight: 0, unitPrice: 0, profit: 0, totalPrice: 0, name: null, ink: null, i: null })
    setProductsToQuote(aux)
  }

  const onChangeMarking = (i, j, k) => {
    let aux = [...productsToQuote]
    aux[i].markings[j].name = markings[k].name
    aux[i].markings[j].i = k
    aux[i].markings[j].ink = null
    aux[i] = calculatePrices(aux[i])
    setProductsToQuote(aux)
  }

  const onChangeInk = (i, j, k) => {
    let aux = [...productsToQuote]
    aux[i].markings[j].ink = markings[aux[i].markings[j].i].inks[k]
    aux[i] = calculatePrices(aux[i])
    setProductsToQuote(aux)
  }

  const deleteMarking = (i, j) => {
    let aux = [...productsToQuote]
    aux[i].markings.splice(j, 1)
    setProductsToQuote(aux)
  }

  const onChangePrice = (i, j) => {
    let aux = [...productsToQuote]
    aux[i].price = aux[i].product.prices[j].price
    aux[i].priceDescription = aux[i].product.prices[j].description
    aux[i] = calculatePrices(aux[i])
    setProductsToQuote(aux)
  }

  const onTypePriceChange = (i, v) => {
    let aux = [...productsToQuote]
    aux[i].typeOfPrice = v
    aux[i] = calculatePrices(aux[i])
    setProductsToQuote(aux)
  }

  const onChangeObservations = (i, v) => {
    let aux = [...productsToQuote]
    aux[i].observations = v.target.value
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
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                      <Card style={{ marginRight: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={`https://catalogospromocionales.com/${product.product.photo}`} style={{ objectFit: 'contain', width: '200px' }} alt={product.product.description} />
                      </Card>
                      <div style={{ width: '230px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '900' }}>SKU:</p>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '300' }}>{product.product.sku}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '900' }}>Descripcion:</p>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '300' }}>{product.product.description}</p>
                        </div>
                        <Form.Item style={{ marginRight: '15px', width: '200px', marginBottom: '5px' }} label='Precio' rules={[{ required: true }]}>
                          <Select
                            showSearch
                            style={{ width: 200 }}
                            value={product.price}
                            onChange={(v) => onChangePrice(i, v)}
                            placeholder="Selecciona un precio"
                            optionFilterProp="children"
                          >
                            {product.product.prices.map((p, j) => (
                              <Option value={j} key={`prices${i}-${j}`}>{p.price}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '900' }}>Descripcion del precio:</p>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '300' }}>{product.priceDescription}</p>
                        </div>
                        <Form.Item style={{ marginRight: '15px', marginBottom: '5px' }} label='Tipo' rules={[{ required: true }]}>
                          <Select
                            showSearch
                            style={{ width: 200 }}
                            onChange={(v) => onTypePriceChange(i, v)}
                            placeholder="Selecciona el tipo de precio"
                            optionFilterProp="children"
                            value={product.typeOfPrice}
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            <Option value={'net'}>Neto</Option>
                            <Option value={'offer'}>Oferta</Option>
                            <Option value={'full'}>Normal / Full</Option>
                          </Select>
                        </Form.Item>
                        <div style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '900' }}>Precio neto:</p>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '300' }}>{product.netPrice}</p>
                        </div>
                        {product.typeOfPrice === 'full' &&
                          <Checkbox value={product.discount}>
                            Aplicar descuento
                          </Checkbox>
                        }
                        <Form.Item label="Observaciones" style={{ width: 200, marginRight: '15px' }} rules={[{ required: true }]}>
                          <Input.TextArea style={{ minWidth: '220px' }} name='observations' value={product.observations} placeholder='Observaciones' onChange={(v) => onChangeObservations(i, v)} />
                        </Form.Item>
                      </div>
                      <div style={{ minWidth: '550px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Form.Item label="Cantidad" style={{ width: 100, marginRight: '15px', marginBottom: '0px' }} rules={[{ required: true }]}>
                            <Input
                              name='amount'
                              value={product.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              placeholder='Cantidad'
                              style={{ width: 100 }}
                              onChange={(v) => onChangeHandler(v, i)} />
                          </Form.Item>
                          <Form.Item label="Flete" style={{ width: 100, marginRight: '15px', marginBottom: '0px' }} rules={[{ required: true }]}>
                            <Input
                              prefix='$'
                              name='freight'
                              value={product.freight.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              placeholder='Flete'
                              style={{ width: 100 }}
                              onChange={(v) => onChangeHandler(v, i)} />
                          </Form.Item>
                          <Form.Item label="Utilidad %" style={{ width: 70, marginRight: '15px', marginBottom: '0px' }} rules={[{ required: true }]}>
                            <Input
                              suffix='%'
                              name='profit'
                              value={product.profit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              placeholder='Utilidad'
                              style={{ width: 70 }}
                              onChange={(v) => onChangeHandler(v, i)} />
                          </Form.Item>
                        </div>
                        <Divider style={{ margin: '15px' }} />
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
                              {m.name && markings[m.i].inks.length > 0 &&
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
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Form.Item label="Marcacion" style={{ width: 100, marginRight: '15px' }} rules={[{ required: true }]}>
                                <Input
                                  prefix='$'
                                  name='markingPrice'
                                  value={Number.parseFloat(m.markingPrice).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  placeholder='Precio de marcacion'
                                  style={{ width: 110 }}
                                  onChange={(v) => onChangeHandlerMark(v, i, j)} />
                              </Form.Item>
                              <Form.Item label="Precio unitario" style={{ width: 100, marginRight: '15px' }} rules={[{ required: true }]}>
                                <Input
                                  prefix='$'
                                  name='unitPrice'
                                  value={Number.parseFloat(m.unitPrice).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  placeholder='Precio unitario'
                                  style={{ width: 110 }}
                                  onChange={(v) => onChangeHandlerMark(v, i, j)} />
                              </Form.Item>
                              <Form.Item label="Total" style={{ width: 130, marginRight: '15px' }} rules={[{ required: true }]}>
                                <Input
                                  prefix='$'
                                  name='totalPrice'
                                  value={Number.parseFloat(m.totalPrice).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  placeholder='Precio Total'
                                  style={{ width: 130 }}
                                  onChange={(v) => onChangeHandlerMark(v, i, j)} />
                              </Form.Item>
                            </div>
                            <Divider style={{ margin: '15px' }} />
                          </div>
                        ))}
                        <Button onClick={() => addMarking(i)}>
                          Agregar Marcación
                        </Button>
                      </div>
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
