import {
  FileOutlined,
  TeamOutlined,
  PlusOutlined,
  BgColorsOutlined,
  PercentageOutlined,
  EditOutlined
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
        key: `${APP_PREFIX_PATH}/quote`,
        path: `${APP_PREFIX_PATH}/quote`,
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

  menu.push(customerMenu)
  menu.push(quoteMenu)
  menu.push(markingsMenu)
  menu.push(discountMenu)

  return menu
}

export default navigationConfig;
