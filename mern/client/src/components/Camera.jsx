import React, { useRef, useState } from "react";

const CameraComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  const [prompt, setPrompt] = useState(""); // State to store the generated prompt
  const [loading, setLoading] = useState(false); // State to track if the request is in progress

  // Function to request camera permissions and show the video on screen
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      console.error("Error accessing the camera: ", error);
    }
  };

  // Function to capture the image from the video
  const capturePhoto = () => {
    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    const image = canvasRef.current.toDataURL("image/png"); // Save the image as base64
    setImageData(image);
  };

  // Function to communicate with the API and get the text prompt
  const handleSubmit = async () => {
    if (imageData && !loading) {
      setLoading(true);
  
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: imageData,
            clip_model_name: "ViT-L-14/openai",
            mode: "fast"
          }),
        });
  
        const result = await response.json();
        console.log("Response from API: ", result);
  
        if (result && result.prompt) {
          setPrompt(result.prompt); // Update the state with the generated prompt
        } else {
          console.log("No prompt returned in the response");
        }
      } catch (error) {
        console.error("Error communicating with the API: ", error);
      } finally {
        setLoading(false); 
      }
    }
  };

  return (
    <div>
      <video ref={videoRef} style={{ width: "100%" }}></video>
      <button onClick={startCamera} className="custom-btn btn-1">Activate Camera</button>
      <button onClick={capturePhoto} className="custom-btn btn-1">Take Photo</button>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      {imageData && <img src={imageData} alt="captured" style={{ width: "100%" }} />}
      
      {/* Disable the button while loading */}
      <button onClick={handleSubmit} className="custom-btn btn-1" id="upload-btn" disabled={loading}>
        {loading ? "Submitting..." : "Submit Photo"}
      </button>

      {/* Display the generated prompt below */}
      {prompt && (
        <div>
          <h3>Generated Prompt:</h3>
          <p>{prompt}</p>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;

/* import React, { useRef, useState } from "react";

const CameraComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageData, setImageData] = useState(null);

  // Función para pedir permisos de la cámara y mostrar el video en pantalla
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      console.error("Error al acceder a la cámara: ", error);
    }
  };

  // Función para capturar la imagen desde el video
  const capturePhoto = () => {
    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    const image = canvasRef.current.toDataURL("image/png"); // Guardar la imagen en base64
    setImageData(image);
  };

  // Función para subir la foto capturada al backend
  const handleSubmit = async () => {
    if (imageData) {
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: imageData }),
        });
        const result = await response.json();
        console.log("Foto subida exitosamente: ", result);
      } catch (error) {
        console.error("Error al subir la imagen: ", error);
      }
    }
  };

  return (
    <div>
      <video ref={videoRef} style={{ width: "100%" }}></video>
      <button onClick={startCamera} className="custom-btn btn-1">Activar Cámara</button>
      <button onClick={capturePhoto} className="custom-btn btn-1">Tomar Foto</button>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      {imageData && <img src={imageData} alt="captured" style={{ width: "100%" }} />}
      <button onClick={handleSubmit} className="custom-btn btn-1" id="upload-btn">Subir Foto</button>
    </div>
  );
};

export default CameraComponent; */
