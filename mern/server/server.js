import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import records from "./routes/record.js";
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo config.env
dotenv.config({ path: 'config.env' });

// Usar la URI de MongoDB desde las variables de entorno
const MONGO_URI = process.env.MONGO_URI || process.env.ATLAS_URI;

console.log("Intentando conectar a MongoDB con la URI:", MONGO_URI); // Agrega esta línea para depuración

if (!MONGO_URI) {
  console.error("Error: MONGO_URI no está definida en el archivo de configuración.");
  process.exit(1);  // Salir del proceso si no está definida la URI
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch((error) => console.error('Error conectando a MongoDB:', error));

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Esquema de Mongoose para almacenar las imágenes
const imageSchema = new mongoose.Schema({
  imageData: Buffer,
  contentType: String,
});

const Image = mongoose.model("Image", imageSchema);

// Ruta para recibir la imagen
app.post("/api/upload", async (req, res) => {
  try {
    const { image } = req.body;

    // Decodificar la imagen base64
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Crear el documento en MongoDB
    const newImage = new Image({
      imageData: buffer,
      contentType: "image/png",
    });

    await newImage.save();
    res.json({ message: "Imagen subida correctamente!" });
  } catch (error) {
    console.error("Error al subir la imagen: ", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Middleware para procesar JSON
app.use("/record", records);

// Iniciar el servidor
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
