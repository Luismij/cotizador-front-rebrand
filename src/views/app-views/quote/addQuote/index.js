import React, { useState, useEffect } from 'react'
import { Select, Card, Form, Button, Input, Modal, Divider, Checkbox, message, Table } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { APP_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'
import Loading from 'components/shared-components/Loading'
import axios from 'axios'

const { Option } = Select;

const onFinish = async (data, setLoading, history) => {
  setLoading(true)
  const jwt = localStorage.getItem('jwt')

  try {
    const options = {
      url: `${API_BASE_URL}/quote/`,
      method: 'POST',
      data,
      headers: {
        "Content-Type": "application/json",
        'jwt-token': jwt
      }
    }
    await axios.request(options)
    message.success({ content: 'Cotizacion creada' })
    history.push(`${APP_PREFIX_PATH}/quotes`)
  } catch (error) {
    message.error({ content: 'Something went wrong' })
    console.error(error);
    setLoading(false)
  }
}

const getStock = async (sku) => {
  const jwt = localStorage.getItem('jwt')
  // Get the stock of a product
  try {
    const options = {
      url: `${API_BASE_URL}/product/stock/${sku}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'jwt-token': jwt
      }
    }
    const stock = (await axios.request(options)).data
    return stock
  } catch (error) {
    message.error({ content: `No se pudo cargar el stock de ${sku}` })
    return []
  }
}

const AddQuote = ({ history }) => {
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [customer, setCustomer] = useState(0)
  const [products, setProducts] = useState([])
  const [markings, setMarkings] = useState([])
  const [stock, setStock] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [discount, setDiscount] = useState(null)
  const [usbDiscount, setUsbDiscount] = useState(null)
  const [quote, setQuote] = useState({ customer: null, wayToPay: '', validityPeriod: '', deliveryTime: '', seller: '', generalObservations: '', products: [{ product: null, price: 0, typeOfPrice: 'net', priceDescription: '', markings: [{ freight: 0, profit: 0, netPrice: 0, amount: 0, markingPrice: 0, unitPrice: 0, totalPrice: 0, name: null, ink: null, i: null }], discount: false, usbDiscount: false, observations: '' }] })

  useEffect(() => {
    const CancelToken = axios.CancelToken.source();
    const init = async () => {
      const jwt = localStorage.getItem('jwt')
      // Get the list of customers
      try {
        const options = {
          url: API_BASE_URL + '/customer/',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        const res = await axios.request(options)
        setCustomers(res.data)
      } catch (error) {
        console.error(error);
      }
      // Get the list of products
      try {
        const options = {
          url: API_BASE_URL + '/product/',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        const res = await axios.request(options)
        setProducts(res.data)
      } catch (error) {
        console.error(error);
      }
      // Get the list of markings
      try {
        const options = {
          url: API_BASE_URL + '/marking/',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        const res = await axios.request(options)
        setMarkings(res.data)
      } catch (error) {
        console.error(error);
      }
      // Get discounts
      try {
        const options = {
          url: API_BASE_URL + '/discount/',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        const res = (await axios.request(options)).data
        setDiscount(res)
      } catch (error) {
        console.error(error);
      }
      // Get USB discounts
      try {
        const options = {
          url: API_BASE_URL + '/usbdiscount/',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'jwt-token': jwt
          }
        }
        const res = (await axios.request(options)).data
        setUsbDiscount(res)
      } catch (error) {
        console.error(error);
      }
      setLoading(false)
    }
    init()
    return () => CancelToken.cancel('Cancelling in cleanup')
  }, [])

  const onChangeCustomer = (i) => {
    setCustomer(i)
    let aux = { ...quote }
    aux.customer = customers[i]
    setQuote(aux)
  }

  const calculatePrices = (product, isMark) => {
    product.markings.forEach((mark, j) => {
      switch (product.typeOfPrice) {
        case 'net':
          mark.netPrice = product.price
          break;
        case 'offer':
          mark.netPrice = (product.price * 0.6) * 0.85
          break;
        case 'full':
          mark.netPrice = product.price * 0.6
          break;
        default:
          break;
      }

      if (product.discount && discount && discount.ranges.length > 0) {
        let inRange = false
        for (const range of discount.ranges) {
          if (mark.amount * mark.netPrice >= range.min && mark.amount * mark.netPrice <= range.max) {
            mark.netPrice = mark.netPrice * ((100 - range.discount) / 100)
            inRange = true
            break
          } else if (mark.amount * mark.netPrice < range.min) inRange = true
        }
        if (!inRange) {
          mark.netPrice = mark.netPrice * ((100 - discount.outOfRangeDiscount) / 100)
        }
      }

      if (product.usbDiscount && usbDiscount && usbDiscount.ranges.length > 0) {
        let inRange = false
        for (const range of usbDiscount.ranges) {
          if (mark.amount * mark.netPrice >= range.min && mark.amount * mark.netPrice <= range.max) {
            mark.netPrice = (mark.netPrice) * ((100 - range.discount) / 100)
            inRange = true
            break
          } else if (mark.amount * mark.netPrice < range.min) inRange = true
        }
        if (!inRange) {
          mark.netPrice = mark.netPrice * ((100 - usbDiscount.outOfRangeDiscount) / 100)
        }
      }

      let sum = 0
      if (mark.ink) {
        let inRange = false
        for (const ran of mark.ink.ranges) {
          if (mark.amount >= ran.min && mark.amount <= ran.max) {
            sum = mark.amount * ran.price
            inRange = true
            break
          } else if (mark.amount < ran.min) {
            sum = mark.ink.minTotalPrice
            inRange = true
          }
        }
        if (!inRange) {
          sum += mark.ink.outOfRangePrice * mark.amount
        }
      }
      if (sum > 0) {
        if (!isMark) product.markings[j].markingPrice = sum / mark.amount
      } else product.markings[j].markingPrice = 0
      product.markings[j].unitPrice = parseInt((parseInt(mark.netPrice) + parseInt(product.markings[j].markingPrice) + parseInt(product.markings[j].freight)) / (product.markings[j].profit > 0 ? ((100 - product.markings[j].profit) / 100) : 1))
      product.markings[j].totalPrice = parseInt(product.markings[j].unitPrice * mark.amount)
    });
    return product
  }

  const openStock = async (sku) => {
    setStock('loading')
    setIsOpen(true)
    setStock(await getStock(sku))
  }

  const addProduct = () => {
    let aux = { ...quote }
    aux.products.push({ product: null, price: 0, typeOfPrice: 'net', priceDescription: '', markings: [{ freight: 0, profit: 0, netPrice: 0, amount: 0, markingPrice: 0, unitPrice: 0, totalPrice: 0, name: null, ink: null, i: null }], discount: false, usbDiscount: false, observations: '' })
    setQuote(aux)
  }

  const deleteProduct = (i) => {
    let aux = { ...quote }
    aux.products.splice(i, 1)
    setQuote(aux)
  }

  const onChangeProduct = (j, i) => {
    let aux = { ...quote }
    aux.products[i].product = products[j]
    if (aux.products[i].product.prices[0]) {
      aux.products[i].price = aux.products[i].product.prices[0].price
      aux.products[i].priceDescription = aux.products[i].product.prices[0].description
    }
    aux.products[i] = calculatePrices(aux.products[i])
    setQuote(aux)
  }

  const onChangeHandlerMark = (v, i, j) => {
    const value = v.target.value.toString().replace(/\$\s?|(,*)/g, '')
    if (!(value.match(/^\d+\.\d+$/) || value.match(/^\d+$/)) && value !== '') return
    if (value < 0) return
    let aux = { ...quote }
    aux.products[i].markings[j][v.target.name] = value !== '' ? parseInt(value) : 0
    if (v.target.name !== 'totalPrice') aux.products[i] = calculatePrices(aux.products[i], v.target.name === 'markingPrice')
    setQuote(aux)
  }

  const addMarking = (i) => {
    let aux = { ...quote }
    aux.products[i].markings.push({ freight: 0, profit: 0, netPrice: 0, amount: 0, markingPrice: 0, unitPrice: 0, totalPrice: 0, name: null, ink: null, i: null })
    setQuote(aux)
  }

  const onChangeMarking = (i, j, k) => {
    let aux = { ...quote }
    aux.products[i].markings[j].name = markings[k].name
    aux.products[i].markings[j].i = k
    aux.products[i].markings[j].ink = null
    aux.products[i] = calculatePrices(aux.products[i])
    setQuote(aux)
  }

  const onChangeInk = (i, j, k) => {
    let aux = { ...quote }
    aux.products[i].markings[j].ink = markings[aux.products[i].markings[j].i].inks[k]
    aux.products[i] = calculatePrices(aux.products[i])
    setQuote(aux)
  }

  const deleteMarking = (i, j) => {
    let aux = { ...quote }
    aux.products[i].markings.splice(j, 1)
    setQuote(aux)
  }

  const onChangePrice = (i, j) => {
    let aux = { ...quote }
    aux.products[i].price = aux.products[i].product.prices[j].price
    aux.products[i].priceDescription = aux.products[i].product.prices[j].description
    aux.products[i] = calculatePrices(aux.products[i])
    setQuote(aux)
  }

  const onTypePriceChange = (i, v) => {
    let aux = { ...quote }
    aux.products[i].typeOfPrice = v
    aux.products[i] = calculatePrices(aux.products[i])
    setQuote(aux)
  }

  const onChangeObservations = (i, v) => {
    let aux = { ...quote }
    aux.products[i].observations = v.target.value
    setQuote(aux)
  }

  const applyDiscount = (v, i) => {
    let aux = { ...quote }
    aux.products[i].discount = v.target.checked
    aux.products[i] = calculatePrices(aux.products[i])
    setQuote(aux)
  }

  const applyUsbDiscount = (v, i) => {
    let aux = { ...quote }
    aux.products[i].usbDiscount = v.target.checked
    aux.products[i] = calculatePrices(aux.products[i])
    setQuote(aux)
  }

  if (loading) return (
    <div>
      <Loading cover="content" />
    </div>
  )

  const columns = [
    {
      title: 'Bodega Local',
      dataIndex: 'bodegaLocal',
      key: 'bodegaLocal',
    },
    {
      title: 'Bodega Zona Franca',
      dataIndex: 'bodegaZonaFranca',
      key: 'bodegaZonaFranca',
    },
    {
      title: 'Cantidad Transito',
      dataIndex: 'cantidadTransito',
      key: 'cantidadTransito',
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: 'Total Disponible',
      dataIndex: 'totalDisponible',
      key: 'totalDisponible',
    },
    {
      title: 'Estado de la orden',
      dataIndex: 'estadoOrden',
      key: 'estadoOrden',
    },
    {
      title: 'Llegada Bodega Local',
      dataIndex: 'llegadaBodegaLocal',
      key: 'llegadaBodegaLocal',
    },
  ]

  return (
    <div>
      <Modal
        visible={isOpen}
        onOk={() => setIsOpen(false)}
        onCancel={() => setIsOpen(false)}
        footer={<></>}
        width={1000}
      >
        {stock[0]?.referencia &&
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>{stock[0].referencia}</h2>
          </div>
        }
        {stock !== 'loading' ?
          < Table columns={columns} dataSource={stock} rowKey='id' /> :
          <div style={{ height: '200px' }}>
            <Loading cover="content" />
          </div>
        }
      </Modal>
      <Card>
        <Form onFinish={(form) => onFinish(form, setLoading, history)}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Form.Item label='Razon social' name={['customer']} rules={[{ required: true }]}>
              <Select
                showSearch
                style={{ width: 200 }}
                placeholder="Selecciona un cliente"
                optionFilterProp="children"
                value={customer}
                onChange={onChangeCustomer}
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {customers.map((p, i) => (
                  <Option value={i} key={p._id}>{p.businessName}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Vendedor">
              <Input
                name='seller'
                value={quote.seller}
                placeholder='Vendedor'
                style={{ width: 150 }}
                onChange={(v) => setQuote({ ...quote, seller: v.target.value })} />
            </Form.Item>
            <Form.Item label="Tiempo de entrega">
              <Input
                name='deliveryTime'
                value={quote.deliveryTime}
                placeholder='Tiempo de entrega'
                style={{ width: 150 }}
                onChange={(v) => setQuote({ ...quote, deliveryTime: v.target.value })} />
            </Form.Item>
            <Form.Item label="Validez de la propuesta">
              <Input
                name='validityPeriod'
                value={quote.validityPeriod}
                placeholder='Validez de la propuesta'
                style={{ width: 150 }}
                onChange={(v) => setQuote({ ...quote, validityPeriod: v.target.value })} />
            </Form.Item>
            <Form.Item label="Forma de pago">
              <Input
                name='wayToPay'
                value={quote.wayToPay}
                placeholder='Forma de pago'
                style={{ width: 150 }}
                onChange={(v) => setQuote({ ...quote, wayToPay: v.target.value })} />
            </Form.Item>
            <Form.Item label="Observaciones">
              <Input.TextArea
                name='generalObservations'
                value={quote.generalObservations}
                placeholder='Observaciones generales'
                style={{ width: 150 }}
                onChange={(v) => setQuote({ ...quote, generalObservations: v.target.value })} />
            </Form.Item>
          </div>
          {quote.products.map((product, i) => (
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
                {product.product &&
                  <Button onClick={() => openStock(product.product.sku)}>Ver Stock</Button>
                }
                <Button style={{ backgroundColor: '#ff7575' }} onClick={() => deleteProduct(i)}>
                  <DeleteFilled style={{ color: 'white', fontSize: '20px' }} />
                </Button>
              </div>
              {product.product &&
                <>
                  <Card>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                      <Card style={{ marginRight: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img crossOrigin={null} src={product.product.photo && product.product.photo[0] === '/' ? `https://catalogospromocionales.com${product.product.photo}` : product.product.photo} style={{ objectFit: 'contain', width: '200px' }} alt={product.product.name} />
                      </Card>
                      <div style={{ width: '230px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '900' }}>Nombre:</p>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '300' }}>{product.product.name}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '900' }}>SKU:</p>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '300' }}>{product.product.sku}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '900' }}>Descripcion:</p>
                          <div dangerouslySetInnerHTML={{ __html: `<div>${product.product.description}</div>` }} />
                        </div>
                        <Form.Item style={{ marginRight: '15px', width: '200px', marginBottom: '5px' }} label='Precio' rules={[{ required: true }]}>
                          <Select
                            showSearch
                            style={{ width: 200 }}
                            value={`$${product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
                            onChange={(v) => onChangePrice(i, v)}
                            placeholder="Selecciona un precio"
                            optionFilterProp="children"
                          >
                            {product.product.prices.map((p, j) => (
                              <Option value={j} key={`prices${i}-${j}`}>${p.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '900' }}>Descripcion del precio:</p>
                          <p style={{ marginRight: '10px', marginBottom: '0px', fontWeight: '700', color: 'red' }}>{product.priceDescription}</p>
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
                        <Checkbox style={{ marginLeft: 10 }} checked={product.discount} onChange={(v) => applyDiscount(v, i)}>
                          Aplicar descuento
                        </Checkbox>
                        <Checkbox style={{ marginLeft: 10 }} checked={product.usbDiscount} onChange={(v) => applyUsbDiscount(v, i)}>
                          Aplicar descuento USB
                        </Checkbox>
                        <Form.Item label="Observaciones" style={{ width: 200, marginRight: '15px' }} rules={[{ required: true }]}>
                          <Input.TextArea style={{ minWidth: '220px' }} name='observations' value={product.observations} placeholder='Observaciones' onChange={(v) => onChangeObservations(i, v)} />
                        </Form.Item>
                      </div>
                      <div style={{ minWidth: '550px', display: 'flex', flexDirection: 'column' }}>
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
                                      <Option value={k} key={`ink ${i - j - k}`}>{ink.name}</Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              }
                              <Button style={{ backgroundColor: '#ff7575' }} onClick={() => deleteMarking(i, j)}>
                                <DeleteFilled style={{ color: 'white', fontSize: '20px' }} />
                              </Button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', width: 500 }}>
                              <Form.Item label="Cantidad" style={{ width: 100, marginRight: '15px' }} rules={[{ required: true }]}>
                                <Input
                                  name='amount'
                                  value={m.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  placeholder='Cantidad'
                                  style={{ width: 100 }}
                                  onChange={(v) => onChangeHandlerMark(v, i, j)} />
                              </Form.Item>
                              <Form.Item label="Flete" style={{ width: 100, marginRight: '15px' }} rules={[{ required: true }]}>
                                <Input
                                  prefix='$'
                                  name='freight'
                                  value={m.freight.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  placeholder='Flete'
                                  style={{ width: 100 }}
                                  onChange={(v) => onChangeHandlerMark(v, i, j)} />
                              </Form.Item>
                              <Form.Item label="Utilidad %" style={{ width: 100, marginRight: '15px' }} rules={[{ required: true }]}>
                                <Input
                                  suffix='%'
                                  name='profit'
                                  value={m.profit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  placeholder='Utilidad'
                                  style={{ width: 70 }}
                                  onChange={(v) => onChangeHandlerMark(v, i, j)} />
                              </Form.Item>
                              <Form.Item label="Precio Neto" style={{ width: 100, marginRight: '15px' }} rules={[{ required: true }]}>
                                <Input
                                  prefix='$'
                                  value={Number.parseInt(m.netPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  placeholder='Precio neto'
                                  style={{ width: 110 }}
                                />
                              </Form.Item>
                              <Form.Item label="Marcacion" style={{ width: 100, marginRight: '15px' }} rules={[{ required: true }]}>
                                <Input
                                  prefix='$'
                                  name='markingPrice'
                                  value={Number.parseInt(m.markingPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  placeholder='Precio de marcacion'
                                  style={{ width: 110 }}
                                  onChange={(v) => onChangeHandlerMark(v, i, j)} />
                              </Form.Item>
                              <Form.Item label="Precio unitario" style={{ width: 100, marginRight: '15px' }} rules={[{ required: true }]}>
                                <Input
                                  prefix='$'
                                  name='unitPrice'
                                  value={Number.parseInt(m.unitPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  placeholder='Precio unitario'
                                  style={{ width: 110 }}
                                  onChange={(v) => onChangeHandlerMark(v, i, j)} />
                              </Form.Item>
                              <Form.Item label="Total" style={{ width: 130, marginRight: '15px' }} rules={[{ required: true }]}>
                                <Input
                                  prefix='$'
                                  name='totalPrice'
                                  value={Number.parseInt(m.totalPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  placeholder='Precio Total'
                                  style={{ width: 130 }}
                                  onChange={(v) => onChangeHandlerMark(v, i, j)} />
                              </Form.Item>
                            </div>
                            <Divider style={{ margin: '15px' }} />
                          </div>
                        ))}
                        <Button onClick={() => addMarking(i)}>
                          Agregar escala
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
            <Button type="primary" onClick={() => onFinish(quote, setLoading, history)} style={{ marginTop: '15px' }}>
              Crear cotizacion
            </Button>
          </Form.Item>
        </Form>
      </Card >
    </div >
  )
}

export default AddQuote
