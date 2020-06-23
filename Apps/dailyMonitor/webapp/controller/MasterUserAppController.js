sap.ui.define([
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
], function(Dialog, Button, Text){

    const Appname = "dailyMonitor";
    console.log(Appname);
    const servername = "/userControl/PassportWithAppValidation";
    fetch(servername, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
            Appname: Appname
        })
    })
        .then(function (response) {
            if (response.status == 309 || response.status == 311) {
                window.location.href = "/Apps/userControl/webapp";
            } else {
                response.json().then(function (app_id) {
                    if (app_id.length > 0) {
                        console.log(response);
                    } else {
                        var inf = "No tiene permiso para acceder a esta aplicación, será redireccionado al launchpad";
                        var dialog = new Dialog({
                            title: "Error",
                            type: "Message",
                            state: "Error",
                            content: new Text({
                                text: inf
                            }),
                            beginButton: new Button({
                                text: "Continuar",
                                press: function () {
                                    window.location.href = "/Apps/launchpad/webapp";
                                    dialog.close();
                                }
                            }),
                            afterClose: function () {
                                dialog.destroy();
                            }
                        });
                        dialog.open();
                    }
                });
            } 
        });
  

});

