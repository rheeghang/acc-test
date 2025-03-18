import React, { useState, useEffect } from "react";

const App = () => {
  const [alpha, setAlpha] = useState(0);
  const [beta, setBeta] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [shape, setShape] = useState("square"); // 기본 모양 (사각형)
  const [color, setColor] = useState("blue"); // 기본 색상

  const SHAKE_THRESHOLD = 20; // 흔들기 감도 설정
  const SHAKE_INTERVAL = 1000; // 1초 내에 여러 번 감지되지 않도록 설정
  let lastShakeTime = 0;

  const roundTo15Degrees = (angle) => {
    return Math.round(angle / 15) * 15;
  };

  // 랜덤 색상 생성 함수
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

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

      // 기울기에 따라 모양 변경
      if (event.gamma > 30) {
        // 오른쪽으로 30도 이상 기울어진 경우 - 원 모양
        setShape("circle");
      } else if (event.gamma < -30) {
        // 왼쪽으로 30도 이상 기울어진 경우 - 삼각형 모양
        setShape("triangle");
      } else {
        // 기본 상태 - 사각형
        setShape("square");
      }

      // 뒤집힌 경우 (베타가 +90도 또는 -90도에 가까운 경우) - 색상 변경
      if (Math.abs(event.beta) > 80) {
        setColor(getRandomColor());
      }
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
            borderRadius: "10px",
            fontSize: "100px",
            zIndex: 100,
          }}
        >
          📌 메뉴
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
            height: shape === "square" ? "300px" : "300px",
            background: color,
            margin: "20px auto",
            zIndex: -1,
            transition: "all 0.3s",
            borderRadius: shape === "circle" ? "50%" : "0",
            // 삼각형 모양을 위한 스타일
            clipPath: shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : "none",
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
