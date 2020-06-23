const fs =  require("fs");

exports.fileExport = (req, res) => {
    try {
        fs.readFile("../ARP/files/filePowerQuery.xlsx", function(err, data) {
            console.log("leyo el archivo");
    		if(err) throw err;
    		res.writeHead(200, {"Content-Disposition": "attachment;filename=plantillaReporteMetas.xlsx",
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    		res.end(data);
    	});
    }
    catch(error) {
        console.log(error);
    }
};
