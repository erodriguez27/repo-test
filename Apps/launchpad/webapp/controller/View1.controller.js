sap.ui.define([
    "Launchpad/controller/BaseController",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
], function (BaseController, Dialog, Button, Text) {
    "use strict";

    return BaseController.extend("Launchpad.controller.View1", {

        onInit: function () {
            this.getRouter().getRoute("home").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            const servername = "/userControl/LogIn";
            let that = this,
                data = this.getView();
            fetch(servername, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                withCredentials: true
            })
                .then(
                    function (response) {
                        if (response.status == 403) {
                            window.location.href = "/Apps/userControl/webapp";
                            that.showToast("NoSession");
                        } else {
                            response.json().then(function (res) {
                                data.getModel("data").setProperty("/name", res.user[0].username);

                                const serverName = "/app_rolControl/otbenerAppXrol";
                                fetch(serverName, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        user_infor: res.user[0]
                                    })
                                })
                                    .then(function (response) {
                                        response.json().then(function (app_id) {
                                            if (app_id.data.length > 0) {
                                                if (app_id.band.a) {
                                                    data.byId("conf").setVisible(false);
                                                }
                                                if (app_id.band.b) {
                                                    data.byId("reg").setVisible(false);

                                                }
                                                if (app_id.band.c) {
                                                    data.byId("prog").setVisible(false);
                                                }
                                                for (var i = 0; i < app_id.data.length; i++) {
                                                    var aux = "tile" + app_id.data[i].application_id;
                                                    const tile = data.byId(aux.toString());
                                                    if (tile !== undefined) {
                                                        tile.setVisible(true);
                                                    }
                                                    if (app_id.Active.length < 1) {
                                                        data.getModel("data").setProperty("/band", false);
                                                    } else {
                                                        data.getModel("data").setProperty("/band", true);
                                                    }
                                                }
                                            }
                                        });
                                    });
                            });
                        }
                    });
        },

        pressLogout: function () {
            let that = this;
            var dialogConfLogOut = new Dialog({
                title: this.getI18n().getText("LogOutDialog"),
                type: "Message",
                content: new Text({
                    text: this.getI18n().getText("LogOutDialogText")
                }),
                beginButton: new Button({
                    text: this.getI18n().getText("LogOutDialogConf"),
                    press: function () {
                        that.logout();
                        dialogConfLogOut.close();
                        dialogConfLogOut.destroy();
                    }
                }),
                endButton: new Button({
                    text: this.getI18n().getText("LogOutDialogRej"),
                    press: function () {
                        dialogConfLogOut.close();
                    }
                }),
                afterClose: function () {
                    dialogConfLogOut.destroy();
                }
            });
            dialogConfLogOut.open();
        },

        logout: function () {
            const servername = "/userControl/signout";
            let that = this;
            fetch(servername, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                withCredentials: true,
            }).then(
                function (response) {
                    if (response.status == 200) {
                        window.location.href = "/Apps/userControl/webapp";
                    } else {
                        if (response.status == 403) {
                            window.location.href = "/Apps/userControl/webapp";
                            that.showToast("NoSession");
                        }
                    }
                });
        },

        onChangePass: function () {
            var oView = this.getView();
            this.oDialog = sap.ui.xmlfragment("Launchpad.view.DialogLogin", this);
            oView.addDependent(this.oDialog);
            this.oDialog.open();
        },

        onSaveDialog: function () {
            var old_pass = sap.ui.getCore().byId("old").getValue();
            var new_pass = sap.ui.getCore().byId("pass").getValue();
            var conf = sap.ui.getCore().byId("pafss").getValue();
            var user_id;
            var that = this;

            if (this.validString(old_pass)) {
                if (this.validString(new_pass) && this.validString(conf)) {
                    if (new_pass === conf) {
                            const serverName = "/userControl/updateUserPassword";
                            fetch(serverName, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    password: new_pass,
                                    oldpass: old_pass
                                })
                            })
                                .then(
                                    function (response) {
                                        if (response.status === 500) {
                                            console.log("Looks like there was a problem. Status Code: " +
                                                response.status);
                                            console.log(response);
                                            return;
                                        }
                                        if (response.status === 403) {
                                            that.showToast("ExprdSession");
                                            window.location.href = "/Apps/userControl/webapp";
                                            return;
                                        }
                                        response.json().then(function (res) {
                                            if (res.statusCode === 200) {
                                                that.showToast("PassUpdateSuccess");
                                                that.onCloseDialog();
                                            }
                                            if (res.statusCode === 409) {
                                                that.showToast("SamePass");
                                            }
                                            if (res.statusCode === 401) {
                                                that.showToast("IncOld");
                                            }
                                        });

                                    });
                        // else {
                        //     that.showToast("PassVerify");
                        // }
                    } else {
                        this.showToast("PassDontMatch");
                    }
                } else {
                    let prop = this.validString(new_pass) === false ? "NewPassBlank" : "PassRepeat"
                    this.showToast(prop);
                }
            } else {
                this.showToast("PassBlank");
            }
        },

        onCloseDialog: function () {
            sap.ui.getCore().byId("old").setValue("");
            sap.ui.getCore().byId("pass").setValue("");
            sap.ui.getCore().byId("pafss").setValue("");
            this.oDialog.close();
            this.oDialog.destroy();
        },

        press: function (evt) {
            var idView = this.getView().getId(),
                idTile = evt.getSource().sId;
            var band = this.getView().getModel("data").getProperty("/band");

            switch (idTile) {
                case idView + "--tile0":
                    window.location.href = "/Apps/technicalConfiguration/webapp";
                    break;
                case idView + "--tile2":
                    window.location.href = "/Apps/mantenimiento-escenarios/webapp";
                    break;
                case idView + "--tile3":
                    if (band) {
                        window.location.href = "/Apps/liftBreedingPlanningM/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }
                    break;
                case idView + "--tile4":
                    if (band) {
                        window.location.href = "/Apps/breedingPlanningM/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }
                    break;
                case idView + "--tile5":
                    if (band) {
                        window.location.href = "/Apps/annualPostureCurve/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }
                    break;
                case idView + "--tile6":
                    if (band) {
                        window.location.href = "/Apps/incubatorPlanningM/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }

                    break;
                case idView + "--tile7":
                    if (band) {
                        window.location.href = "/Apps/broilersPlanningM/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }

                    break;
                case idView + "--tile8":
                    if (band) {
                        window.location.href = "/Apps/broilerEviction/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }
                    break;
                case idView + "--tile9":
                    window.location.href = "/Apps/userManagement/webapp";
                    break;
                case idView + "--tile10":
                    if (band) {
                        window.location.href = "/Apps/dailyMonitor/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }
                    break;
                case idView + "--tile12":
                    window.location.href = "/Apps/dataImport/webapp";
                    break;
                case idView + "--tile13":
                    if (band) {
                        window.location.href = "/Apps/coldRoom/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }
                    break;
                case idView + "--tile14":
                    if (band) {
                        window.location.href = "/Apps/traceability/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }
                    break;
                case idView + "--tile19":
                    if (band) {
                        window.location.href = "/Apps/higherLayer/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }
                break;
                case idView + "--tile20":
                    if (band) {
                        window.location.href = "/Apps/abaRegressivePlanning/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }
                break;

                case idView + "--tile21":
                    if (band) {
                        window.location.href = "/Apps/SimuladorAva/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }
                break;
                case idView + "--tile22":
                    if (band) {
                        window.location.href = "/Apps/recalculation/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }
                break;
                case idView + "--tile23":
                    if (band) {
                        window.location.href = "/Apps/automatedScheduling/webapp";
                    } else {
                        this.showToast("NoScenary");
                    }
                break;
            }
        }
    });
});