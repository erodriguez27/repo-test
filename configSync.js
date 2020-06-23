module.exports = {
	user: process.env.user || "SOFOS.JMMP",
	password: process.env.pass || "hc2444_BB",
	urlToken: process.env.urlToken || "http://sitag-fiori:8002/sap/opu/odata/sap/ZOD_PL_PLANNER01_SRV/ORD_PROV_Set?$format=json&sap-language=ES",
	urlPostToSap: process.env.urlPostToSap || "http://sitag-fiori:8002/sap/opu/odata/sap/ZOD_PL_PLANNER01_SRV/ORD_PROV_Set"
};

