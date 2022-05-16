import {
  FileOutlined,
  TeamOutlined,
  PlusOutlined,
  BgColorsOutlined,
  PercentageOutlined,
  EditOutlined,
  RocketOutlined,
  UsbOutlined
} from '@ant-design/icons';
import { APP_PREFIX_PATH } from 'configs/AppConfig'

const navigationConfig = (user) => {
  let menu = []

  const customerMenu =
  {
    key: `customers`,
    path: `customers`,
    title: 'Clientes',
    icon: TeamOutlined,
    submenu: [
      {
        key: `${APP_PREFIX_PATH}/customers`,
        path: `${APP_PREFIX_PATH}/customers`,
        title: 'Clientes',
        icon: TeamOutlined,
        submenu: []
      },
      {
        key: `${APP_PREFIX_PATH}/addcustomer`,
        path: `${APP_PREFIX_PATH}/addcustomer`,
        title: 'Crear cliente',
        icon: PlusOutlined,
        submenu: []
      }
    ]
  }
  const quoteMenu =
  {
    key: `Cotizaciones`,
    title: 'Cotizaciones',
    icon: FileOutlined,
    submenu: [
      {
        key: `${APP_PREFIX_PATH}/quotes`,
        path: `${APP_PREFIX_PATH}/quotes`,
        title: 'Cotizaciones',
        icon: FileOutlined,
        submenu: []
      },
      {
        key: `${APP_PREFIX_PATH}/addquote`,
        path: `${APP_PREFIX_PATH}/addquote`,
        title: 'Crear Cotizacion',
        icon: PlusOutlined,
        submenu: []
      }
    ]
  }

  const markingsMenu =
  {
    key: `Marcaciones`,
    title: 'Marcaciones',
    icon: BgColorsOutlined,
    submenu: [
      {
        key: `${APP_PREFIX_PATH}/markings`,
        path: `${APP_PREFIX_PATH}/markings`,
        title: 'Marcaciones',
        icon: BgColorsOutlined,
        submenu: []
      },
      {
        key: `${APP_PREFIX_PATH}/addmarking`,
        path: `${APP_PREFIX_PATH}/addmarking`,
        title: 'Crear Marcacion',
        icon: PlusOutlined,
        submenu: []
      }
    ]
  }

  const discountMenu =
  {
    key: `Descuentos`,
    title: 'Descuentos',
    icon: PercentageOutlined,
    submenu: [
      {
        key: `${APP_PREFIX_PATH}/discount`,
        path: `${APP_PREFIX_PATH}/discount`,
        title: 'Descuentos',
        icon: PercentageOutlined,
        submenu: []
      },
      {
        key: `${APP_PREFIX_PATH}/editdiscount`,
        path: `${APP_PREFIX_PATH}/editdiscount`,
        title: 'Editar Descuento',
        icon: EditOutlined,
        submenu: []
      }
    ]
  }

  const usbDiscountMenu =
  {
    key: `Descuentos USB`,
    title: 'Descuentos USB',
    icon: UsbOutlined,
    submenu: [
      {
        key: `${APP_PREFIX_PATH}/usbdiscount`,
        path: `${APP_PREFIX_PATH}/usbdiscount`,
        title: 'Descuentos',
        icon: UsbOutlined,
        submenu: []
      },
      {
        key: `${APP_PREFIX_PATH}/editusbdiscount`,
        path: `${APP_PREFIX_PATH}/editusbdiscount`,
        title: 'Editar Descuento',
        icon: EditOutlined,
        submenu: []
      }
    ]
  }

  const productsMenu =
  {
    key: `${APP_PREFIX_PATH}/products`,
    title: 'Productos',
    icon: RocketOutlined,
    submenu: [
      {
        key: `${APP_PREFIX_PATH}/products`,
        path: `${APP_PREFIX_PATH}/products`,
        title: 'Productos',
        icon: RocketOutlined,
        submenu: []
      },
      {
        key: `${APP_PREFIX_PATH}/addproduct`,
        path: `${APP_PREFIX_PATH}/addproduct`,
        title: 'Crear Producto',
        icon: PlusOutlined,
        submenu: []
      }
    ]
  }

  menu.push(customerMenu)
  menu.push(quoteMenu)
  menu.push(markingsMenu)
  menu.push(discountMenu)
  menu.push(usbDiscountMenu)
  menu.push(productsMenu)

  return menu
}

export default navigationConfig;
