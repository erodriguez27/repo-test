sap.ui.define([
    "abaRegressivePlanning/controller/BaseController",
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, jQuery, JSONModel, Controller,Filter, FilterOperator) {
    "use strict"

    return BaseController.extend("abaRegressivePlanning.controller.Detail", {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf MasterDetail.view.Detail
         */
        tableExist: false,
        onInit: function () {
            this.getModel('data');
            this.getRouter().getRoute("master").attachMatched(this._onRouteMatched, this)
            console.log("aqui");
        },
       
        openTablepop: function(oEvent){
            console.log(oEvent);
            
            var sEquivalent = oEvent.getSource().oPropagatedProperties.oBindingContexts.data.sPath;
            var jEquivalent = this.getView().getModel('data').getProperty(sEquivalent)
            this.getView().getModel('data').setProperty("/tableEquiv",jEquivalent.equiva) 
            if (!this._dialog) {
                this._dialog = sap.ui.xmlfragment("abaRegressivePlanning.view.DialogEquivalent", this);
                this.getView().addDependent(this._dialog);
            }
            //abrir dialogo de espera
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._dialog);
            
            this._dialog.openBy(oEvent.getSource());;
            // document.addEventListener("click",function closeDialog(oEvent){
            //     if(oEvent.target.id ==="sap-ui-blocklayer-popup"){
            //         sap.ui.getCore().byId("DialogE").close();
            //         document.removeEventListener("click",closeDialog);
            //     }
            // });
            
        },
        showPopOver: function (oEvent) {
            console.log("aqui");
            
            //coloco en el popUp el valor correspondiente, deberia de estar en stats
            let stats = this.getModel('data').getProperty("/stats");
            let actualScenarioName = oEvent.oSource.mProperties.text;
            //busco en stats a con nombre igual al anterior
            let toShow = stats.filter(data => data.scenario == actualScenarioName);
            this.getModel('data').setProperty("/popOverData/scenarioName",
                                                "Aves consumiendo");
            this.getModel('data').setProperty("/popOverData/criaYLevante",
                                    toShow[0].text + ": " + toShow[0].quantity);
            this.getModel('data').setProperty("/popOverData/engorde",
                toShow[1].text + ": " + toShow[1].quantity);
            // create popover
            if (!this._oPopover) {
                this._oPopover = sap.ui.xmlfragment("abaRegressivePlanning.view.Popover", this);
                this.getView().addDependent(this._oPopover);
            }
            this._oPopover.openBy(oEvent.getSource());
        },
        onSelectCombo: function(oEvent){
            oEvent=jQuery.extend(true,{},oEvent);
            var value= oEvent.getParameters().value;
            var oCombox = this.getView().byId(oEvent.getSource().sId)
            var id = oEvent.getSource().sId
            let that = this
            if(value=="Todos")
            {
                oCombox.removeAllSelectedItems()
                oCombox.setSelectedKeys(["Todos"])
            }else{
                var selectK =oCombox.getSelectedKeys()
                var index = selectK.indexOf("Todos");
                if (index > -1) {
                    selectK.splice(index, 1);
                }
                index = selectK.indexOf(value);
                if(index>-1){
                    selectK.splice(index, 1);
                }else{
                    if(value!=""){
                        selectK.push(value)
                    }
                    
                }
                
                oCombox.setSelectedKeys(selectK)

            }
            var oCombox3 = this.getView().byId("__component0---detail--comboSem")
            if(id=="__component0---detail--comboAnio"){
                var oCombox2 = this.getView().byId("__component0---detail--comboMes")
                if(oCombox.getSelectedItems().length>0)
                {
                    var setMeses = []
                    var selectK =oCombox.getSelectedKeys();
                    selectK.forEach(function(item){

                        var meses = that.getView().getModel('data').getProperty("/selectedmes/"+ item)
                        meses.forEach(function(item){
                            var index = setMeses.find(elemento => elemento.name === item.name);
                            if(index==undefined){
                                setMeses.push({name:item.name})
                            }
                        })
                    })
                    that.getView().getModel('data').setProperty("/selectedmes1", setMeses)
                    oCombox2.setEnabled(true)
                }else{
                    oCombox3.setSelectedKeys([])
                    oCombox3.setEnabled(false)
                    oCombox2.setSelectedKeys([])
                    oCombox2.setEnabled(false)
                }
            }else{
                
                if(id=="__component0---detail--comboMes"){
                    if(oCombox.getSelectedItems().length>0)
                    {
                        oCombox3.setEnabled(true)
                    }else{
                        oCombox3.setSelectedKeys([])
                        oCombox3.setEnabled(false)
                    }
                }
            }
            this.changeSem()
        },
        changeSem: function(){
            var aFilter = [];
            var meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
            var filter2 = this.byId("comboAnio")
            var filter3 = this.byId("comboMes")
            aFilter.push(new Filter("name", FilterOperator.Contains,"Todos"))
            var valuesAnios = filter2.getSelectedKeys();
            if(valuesAnios[0]=="Todos"){
                valuesAnios=filter2.getKeys();
            }
            valuesAnios.forEach(function(item){
                if(item!="Todos"){
                    var AniosString = "/" + item
                    var valuesMes = filter3.getSelectedKeys();
                    if(valuesMes[0]=="Todos"){
                        valuesMes=filter3.getKeys();
                    }
                    valuesMes.forEach(function(item){
                        if(item!="Todos"){
                            var index = meses.indexOf(item);
                            index=index+1;
                            item = "/" + index + AniosString;
                            aFilter.push(new Filter("name", FilterOperator.Contains,item));
                        } 
                    })  
                }    
            })

            var oList = this.byId("comboSem");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
        },
        onChangeMenu: function(oEvent){
            var filter1 = this.byId("comboName")
            var aFilter = [];
            if(filter1.getValue()=="Detallados"){
                aFilter.push(new Filter("mes", FilterOperator.NE, ""));
                this.getModel('data').setProperty("/menuDetails", true);
            }else{
                aFilter.push(new Filter("mes", FilterOperator.EQ, ""));
                this.getModel('data').setProperty("/menuDetails", false);
            }
            var filter2 = this.byId("comboAnio")
            var filter3 = this.byId("comboMes")
            var filter4 = this.byId("comboSem")
            var filter5 = this.byId("comboMacroElement")
            filter2.setSelectedKeys([])
            filter3.setSelectedKeys([])
            filter3.setEnabled(false)
            filter4.setSelectedKeys([])
            filter4.setEnabled(false)
            filter5.setSelectedKeys([])
            var oList = this.byId("TreeTableBasic");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
        },
        onChangefilter: function(oEvent) {
         
            var aFilter = [];
        
            var filter1 = this.byId("comboName")
            var filter2 = this.byId("comboAnio")
            var filter3 = this.byId("comboMes")
            var filter4 = this.byId("comboMacroElement")
            var filter5 = this.byId("comboSem")
            if(filter1.getValue()=="Detallados"){
                var valuesAnios= filter2.getSelectedKeys();
                if(valuesAnios[0]=="Todos" || valuesAnios.length==0){
                    valuesAnios=filter2.getKeys();
                }
                
                valuesAnios.forEach(function(item){
                    if(item!="Todos"){
                        aFilter.push(new Filter("anio", FilterOperator.EQ,item));
                    }
                        
                })
                var valuesMes= filter3.getSelectedKeys();
                if(valuesMes[0]=="Todos" || valuesMes.length==0){
                    valuesMes=filter3.getKeys();
                }
                valuesMes.forEach(function(item){
                    if(item!="Todos"){
                        aFilter.push(new Filter("mes", FilterOperator.EQ,item));
                    }
                        
                })
                var valuesSem= filter5.getSelectedKeys();
                if(valuesSem[0]=="Todos" || valuesSem.length==0){
                    valuesSem=filter5.getKeys();
                }
                valuesSem.forEach(function(item){
                    if(item!="Todos"){
                        aFilter.push(new Filter("semana", FilterOperator.EQ,item));
                    }
                        
                })
            }
            else
            {
                aFilter.push(new Filter("mes", FilterOperator.EQ, ""));
            }
            var valuesMacro= filter4.getSelectedKeys();
            if(valuesMacro[0]=="Todos" || valuesMacro[0]==""){
                valuesMes=filter4.getKeys();
            }
            valuesMacro.forEach(function(item){
                if(item!="Todos"){
                    aFilter.push(new Filter("name", FilterOperator.EQ,item));
                }
            })

			// filter binding
			var oList = this.byId("TreeTableBasic");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
        },
        onCollapseAll: function() {
            var oTreeTable = this.byId("TreeTableBasic");
            oTreeTable.collapseAll();
        },
        onCollapseSelection: function() {
            var oTreeTable = this.byId("TreeTableBasic");
            oTreeTable.collapse(oTreeTable.getSelectedIndices());
        },
        onExpandFirstLevel: function() {
            var oTreeTable = this.byId("TreeTableBasic");
            oTreeTable.expandToLevel(1);
           
        },
        onExpandSelection: function() {
            var oTreeTable = this.byId("TreeTableBasic");
            oTreeTable.expand(oTreeTable.getSelectedIndices());
        },
        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf MasterDetail.view.Detail
         */
        _onRouteMatched: function (oEvent) {
            console.log('on route matched')
        },
        goToLaunchpad: function(){
            var dummy = this.getView().getModel("dummy");
            window.location.href = "/Apps/launchpad/webapp";
        }
    });
});
