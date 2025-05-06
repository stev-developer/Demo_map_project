import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Card,
  notification,
  Row,
  Col,
} from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const colors = {
  buttonColor: "#1890ff", // SCAD CN style blue
  textColor: "#07090F", // Dark text color for contrast
};

const Login = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]); // Array to hold OTP digits
  const [timer, setTimer] = useState(60); // 60 seconds timer
  const [otpDisabled, setOtpDisabled] = useState(false); // Disable OTP inputs after time
  const navigate = useNavigate();

  useEffect(() => {
    let countdown;
    if (timer > 0 && otpDisabled) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setOtpDisabled(false); // Enable OTP input after timer ends
      clearInterval(countdown);
    }
    return () => clearInterval(countdown);
  }, [timer, otpDisabled]);

  const openNotification = (type, message) => {
    notification[type]({
      message: message,
      placement: "topRight", // Position the notification at the top-right
      duration: 3, // Auto-close after 3 seconds
    });
  };

  // React NPM Alert
  const showAlert = (message) => {
    notification.open({
      message: "React NPM Alert",
      description: message,
      placement: "topRight",
      duration: 3,
      type: "info", // You can also use "success", "error", "warning"
    });
  };

  const onPhoneFinish = (values) => {
    setPhone(values.phone);
    setUserName(values.name);
    // openNotification("success", "OTP sent successfully (dummy)");

    // Trigger React NPM Alert
    // showAlert("OTP sent successfully. Please check your phone!");

    setStep(2);
    setOtpDisabled(true); // Disable OTP inputs when OTP is sent
  };

  const onOtpFinish = () => {
    openNotification("success", "Login successful");
    navigate("/dashboard", { state: { name: userName } });
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    const otpCopy = [...otp];
    otpCopy[index] = value;
    setOtp(otpCopy);
    if (index < 3 && value) {
      document.getElementById(`otp-${index + 1}`).focus(); // Move focus to next input
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e0f7fa, #ffffff)", // Soft blue to white gradient
      }}
    >
      <Card
        style={{
          width: 400,
          padding: 30,
          borderRadius: 16, // Rounded corners for a softer look
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // Slightly bigger shadow for depth
          backgroundColor: "#ffffff", // White background for the form
        }}
      >
        <Title
          level={3}
          style={{
            textAlign: "center",
            marginBottom: 20,
            color: colors.textColor,
            fontWeight: 500, // Bold for better visibility
          }}
        >
          {step === 1 ? "Sign in with Phone" : "Enter OTP"}
        </Title>

        {step === 1 ? (
          <Form layout="vertical" onFinish={onPhoneFinish}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input
                placeholder="John Doe"
                style={{
                  borderRadius: 8, // Rounded input
                  padding: "10px 12px", // Padding for better input area
                }}
              />
            </Form.Item>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { required: true, message: "Please enter your phone number" },
              ]}
            >
              <Input
                placeholder="e.g. 9876543210"
                maxLength={10}
                style={{
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  background: colors.buttonColor,
                  borderColor: colors.buttonColor,
                  borderRadius: 8,
                }}
              >
                Send OTP
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form layout="vertical" onFinish={onOtpFinish}>
            <Form.Item label="OTP">
              <Row gutter={8} justify="center">
                {otp.map((digit, index) => (
                  <Col span={6} key={index}>
                    <Input
                      id={`otp-${index}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      maxLength={1}
                      style={{
                        textAlign: "center",
                        fontSize: "20px",
                        borderRadius: "8px",
                        height: "40px",
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  background: colors.buttonColor,
                  borderColor: colors.buttonColor,
                  borderRadius: 8,
                }}
              >
                Login
              </Button>
            </Form.Item>
            {otpDisabled && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  color: "#999",
                  marginTop: "10px",
                }}
              >
                Resend OTP in {timer}s
              </div>
            )}
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Login;
