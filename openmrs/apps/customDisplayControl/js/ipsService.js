angular.module('bahmni.common.displaycontrol.custom')
  .service('ipsService', ['$http', function ($http) {
    // Obtener referencias de documentos IPS (ITI-67)
    this.getIpsDocuments = function (patientId) {
      return $http.get(`http://openhim-instance:3000/ips-documents?patientId=${patientId}`)
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          console.error("Error obteniendo documentos IPS LAC:", error);
        });
    };

    // Recuperar un documento IPS (ITI-68)
    this.retrieveIpsDocument = function (documentId) {
      return $http.get(`http://openhim-instance:3000/ips-document/${documentId}`)
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          console.error("Error recuperando documento IPS:", error);
        });
    };

    // Generar QR a partir de IPS (TC11)
    this.generateQrFromIps = function (patientId) {
      return $http.post(`http://openhim-instance:3000/generate-qr`, { patientId: patientId })
        .then(function (response) {
          return response.data.qrCode;
        })
        .catch(function (error) {
          console.error("Error generando QR:", error);
        });
    };

    // Validar QR (TC13/TC14)
    this.validateQr = function (qrCode) {
      return $http.post(`http://openhim-instance:3000/validate-qr`, { qrCode: qrCode })
        .then(function (response) {
          return response.data.result;
        })
        .catch(function (error) {
          console.error("Error validando QR:", error);
        });
    };
  }]);
