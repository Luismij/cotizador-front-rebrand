import React, { useContext } from "react";
import { Menu, Dropdown, Avatar } from "antd";
import {
  EditOutlined,
  SettingOutlined,
  ShopOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useHistory } from "react-router-dom";
import { UserContext } from "contexts/UserContext";
import { APP_PREFIX_PATH, AUTH_PREFIX_PATH, API_BASE_URL } from 'configs/AppConfig'

const menuItem = [
  {
    title: "Edit Profile",
    icon: EditOutlined,
    path: "/"
  },

  {
    title: "Account Setting",
    icon: SettingOutlined,
    path: "/"
  },
  {
    title: "Billing",
    icon: ShopOutlined,
    path: "/"
  },
  {
    title: "Help Center",
    icon: QuestionCircleOutlined,
    path: "/"
  }
]

export const NavProfile = () => {
  const { setUser, user } = useContext(UserContext)
  let history = useHistory();

  const signOut = () => {
    localStorage.removeItem('jwt')
    setUser(null)
    history.push(AUTH_PREFIX_PATH + '/login');
  }
  const profileMenu = (
    <div className="nav-profile nav-dropdown">
      <div className="nav-profile-header">
        {<div className="d-flex">
          <div className="pl-3">
            <h4 className="mb-0">{user?.name}</h4>
            {/* <span className="text-muted">Frontend Developer</span> */}
          </div>
        </div>}
      </div>
      <div className="nav-profile-body">
        <Menu>
          <Menu.Item key={menuItem.length} onClick={() => history.push(APP_PREFIX_PATH + '/edituser')}>
            <span>
              <UserOutlined className="mr-3" />
              <span className="font-weight-normal">Editar usuario</span>
            </span>
          </Menu.Item>
          <Menu.Item key={menuItem.length + 1} onClick={() => history.push(APP_PREFIX_PATH + '/changepassword')}>
            <span>
              <UserSwitchOutlined className="mr-3" />
              <span className="font-weight-normal">Cambiar contraseña</span>
            </span>
          </Menu.Item>
          <Menu.Item key={menuItem.length + 2} onClick={signOut}>
            <span>
              <LogoutOutlined className="mr-3" />
              <span className="font-weight-normal">Cerrar sesión</span>
            </span>
          </Menu.Item>
        </Menu>
      </div>
    </div>
  );
  console.log();
  return (
    <Dropdown placement="bottomRight" overlay={profileMenu} trigger={["click"]}>
      <Menu className="d-flex align-item-center" mode="horizontal">
        <Menu.Item key="profile">
          {user?.logo ?
            <img style={{ width: '45px', objectFit: 'contain' }} src={API_BASE_URL + '/image/' + user.logo} alt='Logo'/> :
            <Avatar icon={<UserOutlined />} />
          }
        </Menu.Item>
      </Menu>
    </Dropdown>
  );
}

export default NavProfile
