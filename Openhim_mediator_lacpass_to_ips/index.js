'use strict';
import express from 'express';
import axios from 'axios';
import { registerMediator } from 'openhim-mediator-utils';
import dotenv from 'dotenv';
import mediatorConfig from './mediatorConfig.json';

// Cargar variables de entorno desde un archivo .env
dotenv.config();

// Configuración de OpenHIM a partir de las variables de entorno
const openhimConfig = {
  username: process.env.OPENHIM_USERNAME || 'root@openhim.org',
  password: process.env.OPENHIM_PASSWORD || '1234',
  apiURL: process.env.OPENHIM_API_URL || 'https://54.232.153.120:8080', // URL de OpenHIM
  trustSelfSigned: true
};

// Registrar el mediador en OpenHIM
registerMediator(openhimConfig, mediatorConfig, err => {
  if (err) {
    throw new Error(`Error al registrar el mediador: ${err}`);
  }
  console.log('Mediador registrado en OpenHIM');
});

// Crear un servidor Express
const app = express();
app.use(express.json());

// Endpoint para buscar documentos IPS (ITI-67)
app.get('/ips-documents', async (req, res) => {
  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).send('El parámetro patientId es obligatorio');
  }

  try {
    const fhirUrl = `${process.env.FHIR_SERVER_URL}/DocumentReference?patient=${patientId}`;
    const response = await axios.get(fhirUrl);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error buscando documentos IPS:', error.message);
    res.status(500).send('Error al buscar documentos IPS');
  }
});

// Endpoint para recuperar un documento IPS (ITI-68)
app.get('/ips-document/:documentId', async (req, res) => {
  const { documentId } = req.params;

  try {
    const fhirUrl = `${process.env.FHIR_SERVER_URL}/DocumentReference/${documentId}`;
    const response = await axios.get(fhirUrl);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error recuperando documento IPS:', error.message);
    res.status(500).send('Error al recuperar documento IPS');
  }
});

// Endpoint para generar un QR desde IPS (TC11)
app.post('/generate-qr', async (req, res) => {
  const { patientId } = req.body;

  if (!patientId) {
    return res.status(400).send('El parámetro patientId es obligatorio');
  }

  try {
    const fhirUrl = `${process.env.FHIR_SERVER_URL}/Bundle?patient=${patientId}&type=document`;
    const response = await axios.get(fhirUrl);
    const documentData = response.data;

    // Lógica para generar el QR a partir de los datos IPS
    const qrData = await generateQrFromIps(documentData);
    res.status(200).json({ qrCode: qrData });
  } catch (error) {
    console.error('Error generando QR:', error.message);
    res.status(500).send('Error al generar QR');
  }
});

// Función para generar el QR desde IPS
async function generateQrFromIps(documentData) {
  // Aquí puedes usar la lógica de generación de QR, como 'qrcode'
  const qrCode = 'QR_CODE_GENERATED'; // Reemplazar por la lógica de generación real
  return qrCode;
}

// Endpoint para validar un QR (TC13/TC14)
app.post('/validate-qr', async (req, res) => {
  const { qrCode } = req.body;

  if (!qrCode) {
    return res.status(400).send('El parámetro qrCode es obligatorio');
  }

  try {
    const validationUrl = `${process.env.GAZELLE_SERVER_URL}/validate-qr?code=${qrCode}`;
    const response = await axios.get(validationUrl);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error validando QR:', error.message);
    res.status(500).send('Error al validar QR');
  }
});

// Iniciar el servidor Express en el puerto especificado en las variables de entorno
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mediador de IPS escuchando en el puerto ${PORT}...`);
});

