import React, { useState, useEffect } from "react";

const App = () => {
  const [alpha, setAlpha] = useState(0);
  const [beta, setBeta] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const SHAKE_THRESHOLD = 15; // 흔들기 감도 설정
  const SHAKE_INTERVAL = 1000; // 1초 내에 여러 번 감지되지 않도록 설정
  let lastShakeTime = 0;

  const roundTo15Degrees = (angle) => Math.round(angle / 15) * 15;

  const requestPermission = () => {
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      DeviceMotionEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === "granted") {
            console.log("Permission granted!");
            setPermissionGranted(true);
          }
        })
        .catch(console.error);
    } else {
      setPermissionGranted(true); // 권한이 필요 없는 경우
    }
  };

  useEffect(() => {
    const handleOrientation = (event) => {
      setAlpha(event.alpha); // Z축 회전 (Yaw)
      setBeta(event.beta);   // X축 기울기 (Pitch)
      setGamma(event.gamma); // Y축 기울기 (Roll)
    };

    const handleMotion = (event) => {
      const now = Date.now();
      if (now - lastShakeTime < SHAKE_INTERVAL) return;

      const { acceleration } = event;
      if (!acceleration) return;

      // 흔들기 감지 로직
      const shakeStrength =
        Math.abs(acceleration.x) +
        Math.abs(acceleration.y) +
        Math.abs(acceleration.z);

      if (shakeStrength > SHAKE_THRESHOLD) {
        setMenuVisible(true);
        lastShakeTime = now;

        // 2초 후 메뉴 숨기기
        setTimeout(() => {
          setMenuVisible(false);
        }, 2000);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "10px" }}>
      {/* 센서 권한 요청 버튼 */}
      {!permissionGranted && (
        <button
          onClick={requestPermission}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            marginBottom: "20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          센서 권한 요청
        </button>
      )}

      {/* 흔들리면 나타나는 메뉴 */}
      {menuVisible && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "10px 20px",
            fontSize: "150px",
            zIndex: 100,
          }}
        >
          메뉴
        </div>
      )}

      {/* 회전하는 요소 */}
      <div style={{ fontSize: "100px" }}>
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) rotate(${gamma}deg)`,
            width: "300px",
            height: "300px",
            background: "blue",
            margin: "20px auto",
            zIndex: -1,
            transition: "transform 0.1s",
          }}
        ></div>

        {/* 센서 값 출력 */}
        <p>Z: {roundTo15Degrees(alpha)}°</p>
        <p>X: {roundTo15Degrees(beta)}°</p>
        <p>Y: {roundTo15Degrees(gamma)}°</p>
      </div>
    </div>
  );
};

export default App;
