'use strict';
import express from 'express';
import axios from 'axios';
import { registerMediator } from 'openhim-mediator-utils';
import mediatorConfig from './mediatorConfig.json';

// Configuración de OpenHIM
const openhimConfig = {
  username: 'root@openhim.org',
  password: '1234',
  apiURL: 'https://54.232.153.120:8080', // URL de OpenHIM
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

  try {
    const fhirUrl = `https://fhir-server.example.com/DocumentReference?patient=${patientId}`;
    const response = await axios.get(fhirUrl);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error buscando documentos IPS:', error);
    res.status(500).send('Error al buscar documentos IPS');
  }
});

// Endpoint para recuperar un documento IPS (ITI-68)
app.get('/ips-document/:documentId', async (req, res) => {
  const { documentId } = req.params;

  try {
    const fhirUrl = `https://fhir-server.example.com/DocumentReference/${documentId}`;
    const response = await axios.get(fhirUrl);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error recuperando documento IPS:', error);
    res.status(500).send('Error al recuperar documento IPS');
  }
});

// Endpoint para generar un QR desde IPS (TC11)
app.post('/generate-qr', async (req, res) => {
  const { patientId } = req.body;

  try {
    const fhirUrl = `https://fhir-server.example.com/Bundle?patient=${patientId}&type=document`;
    const response = await axios.get(fhirUrl);
    const documentData = response.data;

    // Lógica para generar el QR a partir de los datos IPS
    const qrData = await generateQrFromIps(documentData);
    res.status(200).json({ qrCode: qrData });
  } catch (error) {
    console.error('Error generando QR:', error);
    res.status(500).send('Error al generar QR');
  }
});

// Función para generar el QR desde IPS
async function generateQrFromIps(documentData) {
  // Lógica para crear un QR a partir de los datos IPS
  // Por ejemplo, puedes usar una biblioteca como 'qrcode'
  const qrCode = 'QR_CODE_GENERATED'; // Aquí generas el QR
  return qrCode;
}

// Endpoint para validar un QR (TC13/TC14)
app.post('/validate-qr', async (req, res) => {
  const { qrCode } = req.body;

  try {
    const validationUrl = `https://gazelle-server.example.com/validate-qr?code=${qrCode}`;
    const response = await axios.get(validationUrl);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error validando QR:', error);
    res.status(500).send('Error al validar QR');
  }
});

// Iniciar el servidor Express
app.listen(3000, () => {
  console.log('Mediador de IPS escuchando en el puerto 3000...');
});
