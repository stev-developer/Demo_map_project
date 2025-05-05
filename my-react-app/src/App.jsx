import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const App = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1>Welcome to Our App</h1>
      <Button type="primary" onClick={() => navigate("/login")}>
        Go to Login
      </Button>
    </div>
  );
};

export default App;
