import React, { useState, useEffect } from "react";

const App = () => {
  const [alpha, setAlpha] = useState(0);
  const [beta, setBeta] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const roundTo15Degrees = (angle) => {
    return Math.round(angle / 15) * 15;
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
      // 권한이 필요없는 기기(안드로이드 등)의 경우 바로 true로 설정
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    const handleOrientation = (event) => {
      setAlpha(event.alpha); // Yaw (회전)
      setBeta(event.beta);   // Pitch (앞뒤 기울기)
      setGamma(event.gamma); // Roll (좌우 기울기)
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "10px" }}>
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
            cursor: "pointer"
          }}
        >
          센서 권한 요청
        </button>
      )}
      <div  style={{
        fontSize: "100px"
      }}>
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

      <p>Z: {roundTo15Degrees(alpha)}°</p>
      <p>X: {roundTo15Degrees(beta)}°</p>
      <p>Y: {roundTo15Degrees(gamma)}°</p>
      </div>
    </div>
  );
};

export default App;