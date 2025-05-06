import React, { useState } from "react";
import { Layout, Menu, Typography, Dropdown } from "antd";
import {
  DashboardOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Marker,
  Popup,
} from "react-leaflet";
import { FaExpandAlt, FaCompressAlt } from "react-icons/fa";

import "leaflet/dist/leaflet.css";

import MapWithGeoJSON from "./MapWithGeoJson";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

const [colors, setColors] = useState({
  sidebarBackground: "#ffffff", // white sidebar
  sidebarItemColor: "#07090F", // unselected text color
  sidebarItemBGColor: "#f5f5f5", // unselected background
  sidebarItemSelectedBGColor: "#1890ff", // blue selected item
  sidebarItemSelectedColor: "#ffffff", // white selected text
  textColor: "#07090F",
  buttonColor: "#1890ff",
  headerBackground: "#ffffff",
  contentBackground: "#ffffff",
  borderColor: "#f0f0f0",
});



  const [selectedKey, setSelectedKey] = useState("1");

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      // Add logout logic here (e.g., clear tokens, reset state)
      navigate("/");
    } else if (key === "settings") {
      navigate("/settings");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = location.state?.name || "Guest";

    if (hour < 12) return `Good Morning, ${name}`;
    if (hour < 18) return `Good Afternoon, ${name}`;
    if (hour < 21) return `Good Evening, ${name}`; // Optional: 9 PM to 11:59 PM
    return `Good Night, ${name}`; // After 9 PM
  };

  const profileMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const menuItems = [
    { key: "1", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "2", label: "Analyzies", icon: <SettingOutlined /> },
    { key: "3", label: "Reports", icon: <LogoutOutlined /> },
  ];

  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <Layout
      style={{ minHeight: "100vh", background: colors.contentBackground }}
    >
      {/* Sidebar */}
      <Sider
        width={220}
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          backgroundColor: colors.sidebarBackground,
          borderRight: `1px solid ${colors.borderColor}`,
          boxShadow: "2px 0 5px rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            fontWeight: "bold",
            color: colors.sidebarItemColor,
            textAlign: "center",
            fontSize: 20,
            lineHeight: "64px",
          }}
        >
          LOGO
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ background: "transparent", fontWeight: 500 }}
          onClick={({ key }) => {
            setSelectedKey(key);
          }}
        >
          {menuItems.map(({ key, label, icon }) => (
            <Menu.Item
              key={key}
              icon={React.cloneElement(icon, {
                style: {
                  color:
                    selectedKey === key
                      ? colors.sidebarItemSelectedColor // white for selected icon
                      : colors.sidebarItemColor, // default icon color
                },
              })}
              style={{
                backgroundColor:
                  selectedKey === key
                    ? colors.sidebarItemSelectedBGColor
                    : colors.sidebarItemBGColor,
                color:
                  selectedKey === key
                    ? colors.sidebarItemSelectedColor // white text for selected
                    : colors.sidebarItemColor, // default text color
              }}
            >
              {label}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      {/* Main layout */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            background: colors.headerBackground,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${colors.borderColor}`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
          }}
        >
          <Title level={4} style={{ margin: 0, color: colors.textColor }}>
            Dashboard
          </Title>

          <Dropdown
            overlay={profileMenu}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <UserOutlined style={{ fontSize: 18, color: colors.textColor }} />
              <span style={{ color: colors.textColor }}>
                {location.state.name || "Guest"}
              </span>
            </div>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colors.contentBackground,
            minHeight: 280,
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <Title level={5} style={{ color: colors.textColor }}>
            {getGreeting()}
          </Title>
          <p style={{ color: "#555" }}>Here's your dashboard overview.</p>

          {/* Map Section */}
          <div
            style={{
              position: "relative",
              height: isFullScreen ? "100vh" : "400px",
            }}
          >
            {/* <MapContainer
              center={[51.505, -0.09]} // Center the map at a default location (London)
              zoom={13}
              style={{ height: "100%", borderRadius: 10 }}
              zoomControl={false} // Disable default zoom control, we will add custom controls
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ZoomControl position="topright" /> {/* Custom zoom control 
              <Marker position={[51.505, -0.09]}>
                <Popup>Dummy location</Popup>
              </Marker>
            </MapContainer> */}

            <MapWithGeoJSON />

            {/* Fullscreen toggle button */}
            <button
              onClick={toggleFullScreen}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(255,255,255,0.8)",
                border: "none",
                padding: "10px",
                borderRadius: "50%",
                cursor: "pointer",
              }}
            >
              {isFullScreen ? (
                <FaCompressAlt size={20} />
              ) : (
                <FaExpandAlt size={20} />
              )}
            </button>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
