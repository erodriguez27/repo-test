sap.ui.define([
    "abaRegressivePlanning/controller/BaseController",
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/ButtonType",
    'sap/m/Label',
    "sap/m/MessageBox",
    'sap/m/MessageToast',

], function (BaseController, jQuery, JSONModel, Controller,Filter, FilterOperator,Dialog,Button,ButtonType,Label,MessageBox,MessageToast) {
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
        },
        viewGraph: async function(){
            let datas = this.getModel('data').getProperty("/tableInfo1");
            await $.ajax({
                type: "POST",
                contentType: "application/json",
                url: "/ave_simulator/gragh",
                dataType: "json",
                data: JSON.stringify(datas.oData),
                async: true,
                success: function (data) {
                    console.log("Read failed: ", data);
                    var msg = data.statusText;
                },
                error: function (request) {
                    console.log("Read failed: ", request);
                    var msg = request.statusText;
                }
            });    
        },
        onSelectCombo: function(oEvent){
            oEvent=jQuery.extend(true,{},oEvent);
            var value= oEvent.getParameters().value;
            var oCombox = this.getView().byId(oEvent.getSource().sId)

            if(value!=""){
                if("__component0---detail--DP2"==oEvent.getSource().sId)
                {
                    this.getModel('data').setProperty("/datemin1",oCombox.getDateValue());
                }
                else
                {
                    this.getModel('data').setProperty("/datemax1",oCombox.getDateValue());
                }
                oCombox.setValueState("None");
                oCombox.setValueStateText("");
            }
            else
            {
                if("__component0---detail--DP1"==oEvent.getSource().sId)
                {
                    var registro = new Date();
                    oCombox.setDateValue(registro)
                    
                }
            }
        },
        onChangeFilter: function(oEvent){
            var filter1 = this.byId("DP2")
            var filter2 = this.byId("DP3")
            var filter3 = this.byId("comboLote")
            var aFilter = [];
            var fecha1 =  filter1.getDateValue()
            var fecha2 = filter2.getDateValue();
            if(fecha1!=null && fecha2!=null){
                aFilter.push(new Filter("datesCom", FilterOperator.BT, fecha1,fecha2));
            }else{
                if(fecha1==null && fecha2!=null){
                    aFilter.push(new Filter("datesCom", FilterOperator.LE, fecha2));
                }else{
                    if(fecha1!=null && fecha2==null){
                        aFilter.push(new Filter("datesCom", FilterOperator.GE, fecha1));
                    }
                }
            }
            if(filter3.getValue()=="Alojamiento"){
                aFilter.push(new Filter("lot_size", FilterOperator.NE,0))
            }
            var oList = this.byId("TreeTableBasic");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
        },
        onchangeerror: function(oEvent){
            oEvent=jQuery.extend(true,{},oEvent);
            var value_id = oEvent.getSource();
            value_id.setValueState("None");
            value_id.setValueStateText("");
        },
        generate: async function(){   
            
            var scenarioActivo = this.getModel('data').getProperty("/idSelected");
            let data = this.getModel('data');
            var inputfecha =  this.getView().byId("DP1")
            let fecha =  inputfecha.getValue();
            this.getView().byId("comboLote").setSelectedKey("Todos")
            this.getView().byId("DP2").setDateValue(null)            
            this.getView().byId("DP3").setDateValue(null)
            
            var inputalgoritmo = this.getView().byId("comboAlgoritmo")       
            var inputnamePost = this.getView().byId("comboName")
            var inputsAloja = this.getView().byId("comboalojamiento")
            let algoritmo = inputalgoritmo.getSelectedKey()    
            var namePost = inputnamePost.getValue()
            var sAloja = inputsAloja.getValue()
            var post = this.getView().getModel('data').getProperty("/postureRecords");
            var post = post.find(function(element) {
                return element.name == namePost;
            });
            inputfecha.setValueState("None")
            inputfecha.setValueStateText("")
            inputalgoritmo.setValueState("None")
            inputalgoritmo.setValueStateText("")       
            inputnamePost.setValueState("None")
            inputnamePost.setValueStateText("")
            inputsAloja.setValueState("None")
            inputsAloja.setValueStateText("")
            if(fecha!="" && scenarioActivo!="" && post!=undefined && algoritmo!="" && sAloja!=""){
                this.getModel('data').setProperty("/semaforo",false);
                let oModel;
                let inicio = Date.now();
                let that = this;
                
                this.getModel('data').setProperty("/busy", true);
                let jsonInput = {
                    "sAloj": sAloja,
                    "idScenario": scenarioActivo.scenario_id,
                    "fecha":fecha,
                    "breed_id":post.breed_id,
                    "algoritmo":algoritmo
                }
                var compare = this.getModel('data').getProperty("/newImput");
                if(compare.sAloj!=jsonInput.sAloj || compare.idScenario != jsonInput.idScenario || compare.fecha != jsonInput.fecha || compare.breed_id != jsonInput.breed_id || compare.algoritmo!= jsonInput.algoritmo){
                    that.getModel('data').setProperty("/menuGeneral", false);
                    await $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: "/ave_simulator",
                        dataType: "json",
                        data: JSON.stringify(jsonInput),
                        async: true,
                        timeout: 0,
                        success: function (data) {
                            
                            oModel = new JSONModel(data.data);
                            that.getModel('data').setProperty("/newImput",jsonInput);
                            let datos = oModel.oData
                            if(datos.demand.length>0){
                                that.getModel('data').setProperty("/menuGeneral", true);
                                that.getModel('data').setProperty("/tableInfo1", oModel);
                                that.getModel('data').setProperty("/lote", [{name:"Todos"},{name:"Alojamiento"}]);
                                
                                let dato   = [];
                                fecha =  datos.dates[0].split("/")
                                var dates = new Date(fecha[2],fecha[1]-1,fecha[0])

                                dates.setDate(dates.getDate()-7*(datos.lot_size.length - datos.dates.length))
                                that.getModel('data').setProperty("/datemin", new Date(dates.getFullYear(),parseInt(dates.getMonth(), 10),dates.getDate()));
                                that.getModel('data').setProperty("/datemin1", new Date(dates.getFullYear(),parseInt(dates.getMonth(), 10),dates.getDate()));
                                var formatter = new Intl.NumberFormat('en-US');
                                for(var i =0 ; i< datos.demand.length;i++)
                                {
                                    var tempdate = dates.getDate() + "/" + parseInt(dates.getMonth()+1, 10) + "/" + dates.getFullYear();
                                    if(datos.demand[i]!="-" || datos.lot_size[i]>0 ){
                                        var temp = {"datesCom":new Date(dates.getFullYear(),parseInt(dates.getMonth(), 10),dates.getDate()),"dates":tempdate,"demand":datos.demand[i]!="-"?formatter.format(datos.demand[i]):"-","production":datos.production[i]!='-'? formatter.format(Math.round(datos.production[i])):'-',"difference":datos.diference[i]!='-'? formatter.format(Math.round(datos.diference[i])):'-',"lot_size":formatter.format(datos.lot_size[i]),"lot_sizep":datos.lot_size[i],"diferenceNro":datos.diferenceNro[i]!='-'?formatter.format(Math.round(datos.diferenceNro[i])):"-" ,"alojamiento":datos.lot_size[i]-datos.isPrevios[i],"isPrevios":datos.isPrevios[i]>0?"alojamiento ejecutado":"Alojamiento por programar"};
                                        dato.push(temp);
                                    }
                                    
                                    dates.setDate(dates.getDate()+7);
                                }
                                that.getModel('data').setProperty("/datemax1", new Date(dates.getFullYear(),parseInt(dates.getMonth(), 10),dates.getDate()));
                                that.getModel('data').setProperty("/datemax", new Date(dates.getFullYear(),parseInt(dates.getMonth(), 10),dates.getDate()));
                                that.getModel('data').setProperty("/tableInfo", dato);
                            }else{
                                MessageBox.error("No se encontr\u00F3 soluci\u00F3n factible, verifique los par\u00E1metros de cofiguraci\u00F3n o modifique la fecha seleccionada",{title: "Error",actions: ["Cerrar"],
                                emphasizedAction: MessageBox.Action.CLOSE});

                            }
                            that.getModel('data').setProperty("/busy", false);
                            var aFilter = [];
                            var oList = that.byId("TreeTableBasic");
                            var oBinding = oList.getBinding("items");
                            oBinding.filter(aFilter);
                            let fin = Date.now();
                            console.log(inicio-fin)
                
                            that.getModel('data').setProperty("/semaforo",true);
                        },
                        error: function (request) {
                            that.getModel('data').setProperty("/busy", false);
                            that.getModel('data').setProperty("/tableInfo", "");
                            that.getModel('data').setProperty("/semaforo",true);
                            MessageBox.error("Verifique los parámetros técnicos o si existe una demanda asociada a la raza seleccionada",{title: "Error",actions: ["Cerrar"],
                            emphasizedAction: MessageBox.Action.CLOSE});
                        }
                    });//*/
                }else{
                    MessageBox.error("No existe variaciones en los parametros de entrada",{title: "Error",actions: ["Cerrar"],
                    emphasizedAction: MessageBox.Action.CLOSE});
                }
                this.getModel('data').setProperty("/semaforo",true);
                data.setProperty('/busy', false)
            }else{
                this.getModel('data').setProperty("/tableInfo", "");
                var msg= ''
                
                if(fecha==""){
                    inputfecha.setValueState("Error")
                    inputfecha.setValueStateText("El campo no debe ser vacio")
                }
                if(algoritmo=="")
                {
                    inputalgoritmo.setValueState("Error")
                    inputalgoritmo.setValueStateText("El campo no debe ser vacio")
                }
                if(sAloja==""){
                    inputsAloja.setValueState("Error")
                    inputsAloja.setValueStateText("El campo no debe ser vacio")
                }
                if(post==undefined){
                    inputnamePost.setValueState("Error")
                    inputnamePost.setValueStateText("El campo no debe ser vacio")
                }
                var msg = 'Se deben completar campos';
			    MessageToast.show(msg);
            }
            
                
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
        _onRouteMatched: async function (oEvent) {
            console.log('on route matched')
            let that = this;
            let dataModel = that.getView().getModel("data");
            var Today = new Date();

            dataModel.setProperty("/dateminA",new Date(Today.setDate(Today.getDate() )));
            console.log(dataModel);
            
            await $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/scenario/activeScenario",
                dataType: "json",
                async: true,
                success: function (data) {
                    
                    dataModel.setProperty("/idSelected", data);
                    
                },
                error: function (request, status, error) {
                    console.log("Error al consultar escenarios");
                    that.onToast("Error al consultar escenarios");
                }
            });
            let id = dataModel.getProperty("/idSelected");
            $.ajax({
                type: "get",
                contentType: "application/json",
                url: "/ave_simulator/findParameter",
                dataType: "json",
                async: true,
                success: function (data) {
                    that.getView().getModel('data').setProperty("/postureRecords", data.breed);
                    
                    
                },
                error: function (request, status, error) {
                    console.log("Error al consultar escenarios");
                    that.onToast("Error al consultar escenarios");
                }
            });
            let jsonInput = {
                "sAloj": "",
                "idScenario": "",
                "fecha":"",
                "breed_id":"",
                "algoritmo":""
            }
            this.getModel('data').setProperty("/newImput",jsonInput);
        },
        goToLaunchpad: function(){
            
            var dummy = this.getView().getModel("dummy");
            window.location.href = "/Apps/launchpad/webapp";
            
        },
        handleLinkPress: function (oEvent) {
            var _oPopover = this._getResponsivePopover();
            var obj = oEvent.getSource().getBindingContext('data').getObject()
            this.getModel('data').setProperty("/popOverData/diference",obj.diferenceNro);
            this.getModel('data').setProperty("/popOverData/isAlojamiento",obj.isPrevios);
            this.getModel('data').setProperty("/popOverData/AlojamientoT",obj.lot_sizep);
            this.getModel('data').setProperty("/popOverData/AlojamientoP",obj.alojamiento);
            this.getModel('data').setProperty("/popOverData/AlojamientoPP",parseInt(obj.lot_sizep)-obj.alojamiento);
            var column = oEvent.getSource().getId().split("-")[0]
            if(column == "__link0"){
                this.getModel('data').setProperty("/popOverData/booleandif",true);
                this.getModel('data').setProperty("/popOverData/booleanisAlo",false);
                _oPopover.openBy(oEvent.getSource()); 
            }else{
                this.getModel('data').setProperty("/popOverData/booleandif",false);
                this.getModel('data').setProperty("/popOverData/booleanisAlo",true);
                if (obj.lot_sizep > 0) {
                    _oPopover.openBy(oEvent.getSource());  
                }
            }
            
            console.log(obj.lot_sizep)
            
        },
        _getResponsivePopover: function() {
            if (!this._oPopover) {

                this._oPopover = sap.ui.xmlfragment("abaRegressivePlanning.view.Popover", this);
                this.getView().addDependent(this._oPopover);
            }
            return this._oPopover;
		}
    });
});
