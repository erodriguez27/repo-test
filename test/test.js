// var assert    = require("chai").assert;
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
let expect = chai.expect;
// let sinon = require('sinon');
// let id =null;
let assert = chai.assert;

const model = require("../postgresql/models/housingWay.js");


chai.use(chaiHttp);


/* Vamos a probar el back de levante y cria (housingway y housingwaydetail) */

describe("Back Levante y cria", function(){


	describe("HousingWay", function(){

		// describe("Pruebo spies", function(done){
		// 	it("Intento usar un spy sobre un model", function(done){
		// 		// var spy = sinon.spy(model,"DBisProgrammedHousingway");
		// 		var stub = sinon.stub(model,"DBisProgrammedHousingway");
		// 		stub.returns({programmed:true})
		// 		chai.request(server)
		// 			.post('/housingWay/deleteHousingWayById/')
		// 			.send({
		// 				housing_way_id: 1409,
		// 				stage_id: 5, 
		// 				partnership_id: 1, 
		// 				scenario_id:1
		// 			})
		// 			.end(function(err, res){
		// 				res.should.be.json;
		// 				res.should.have.status(200);
		// 				should.exist(res.body.data);
		// 				res.body.data.should.be.a('array');
		// 				// console.log("Aqui está mi spy ",spy)
		// 				done();
						
		// 			});


		// 	});
		// });

		// it("Probaré el metodo GET de housingWay", function(done){
		// 	chai.request(server)
		// 		.get('/housingWay/')
		// 		.end(function(err, res){
		// 			res.should.be.json;
		// 			res.should.have.status(200);
		// 			res.body.data.should.be.a('array');
		// 			done();
		// 		});
		// });

		describe("Pruebo el metodo POST para agregar nuevos registros", function(done){

			// it("Ingreso id's validos", function(done){
			// 	chai.request(server)
			// 		.post('/housingWay/')
			// 		.send({
			// 			projected_quantity: 200,
			// 			projected_date: '20-01-2019',
			// 			stage_id: 5,
			// 			partnership_id: 1,
			// 			scenario_id: 1,
			// 			breed_id: 1,
			// 			predecessor_id: 0
			// 		})
			// 		.end(function(err, res){
			// 			res.should.be.json;
			// 			res.should.have.status(200);
			// 			should.exist(res.body.data);
			// 			done();
			// 		});
			// });

			it("Ingreso id de compañia no valido", function(done){
				chai.request(server)
				.post('/housingWay/')
				.send({
					projected_quantity: 200,
					projected_date: '20-01-2019',
					stage_id: 5,
					partnership_id: 2,
					scenario_id: 1,
					breed_id: 1,
					predecessor_id: 0
				})
				.end(function(err, res){
					res.should.be.json;
					res.should.have.status(500);
					should.not.exist(res.body.data);
					done();
				});
			});
			
			it("Ingreso stage_id no valido", function(done){
				chai.request(server)
				.post('/housingWay/')
				.send({
						projected_quantity: 200,
						projected_date: '20-01-2019',
						stage_id: 230,
						partnership_id: 1,
						scenario_id: 1,
						breed_id: 1,
						predecessor_id: 0
					})
					.end(function(err, res){
						res.should.be.json;
						res.should.have.status(500);
						should.not.exist(res.body.data);
						done();
					});
			});
				
			it("Ingreso scenario_id no valido", function(done){
				chai.request(server)
					.post('/housingWay/')
					.send({
						projected_quantity: 200,
						projected_date: '20-01-2019',
						stage_id: 230,
						partnership_id: 1,
						scenario_id: 100,
						breed_id: 1,
						predecessor_id: 0
					})
					.end(function(err, res){
						res.should.be.json;
						res.should.have.status(500);
						should.not.exist(res.body.data);
						done();
					});
			});
				
			it("Ingreso breed_id no valido", function(done){
				chai.request(server)
				.post('/housingWay/')
				.send({
					projected_quantity: 200,
					projected_date: '20-01-2019',
					stage_id: 230,
					partnership_id: 1,
					scenario_id: 100,
					breed_id: 1,
					predecessor_id: 0
				})
				.end(function(err, res){
					res.should.be.json;
					res.should.have.status(500);
					should.not.exist(res.body.data);
					done();
				});
			});

			// it("Ingreso fecha 20/01/2019", function(done){
			// 	chai.request(server)
			// 		.post('/housingWay/')
			// 		.send({
			// 			projected_quantity: 200,
			// 			projected_date: '20/01/2019',
			// 			stage_id: 5,
			// 			partnership_id: 1,
			// 			scenario_id: 1,
			// 			breed_id: 1,
			// 			predecessor_id: 0
			// 		})
			// 		.end(function(err, res){
			// 			res.should.be.json;
			// 			res.should.have.status(200);
			// 			should.exist(res.body.data);
			// 			done();
			// 		});
			// });
				
			// it("Ingreso fecha 01/20/2019", function(done){
			// 	chai.request(server)
			// 		.post('/housingWay/')
			// 		.send({
			// 			projected_quantity: 200,
			// 			projected_date: '01/20/2019',
			// 			stage_id: 5,
			// 			partnership_id: 1,
			// 			scenario_id: 1,
			// 			breed_id: 1,
			// 			predecessor_id: 0
			// 		})
			// 		.end(function(err, res){
			// 			res.should.be.json;
			// 			res.should.have.status(200);
			// 			should.exist(res.body.data);
			// 			done();
			// 		});
			// });
				
			// it("Ingreso fecha 2019/01/20", function(done){
			// 	chai.request(server)
			// 		.post('/housingWay/')
			// 		.send({
			// 			projected_quantity: 200,
			// 			projected_date: '2019/01/20',
			// 			stage_id: 5,
			// 			partnership_id: 1,
			// 			scenario_id: 1,
			// 			breed_id: 1,
			// 			predecessor_id: 0
			// 		})
			// 		.end(function(err, res){
			// 			res.should.be.json;
			// 			res.should.have.status(200);
			// 			should.exist(res.body.data);
			// 			done();
			// 		});
			// });
				
			// it("Ingreso fecha 2019-01-20", function(done){
			// 	chai.request(server)
			// 		.post('/housingWay/')
			// 		.send({
			// 			projected_quantity: 200,
			// 			projected_date: '2019-01-20',
			// 			stage_id: 5,
			// 			partnership_id: 1,
			// 			scenario_id: 1,
			// 			breed_id: 1,
			// 			predecessor_id: 0
			// 		})
			// 		.end(function(err, res){
			// 			res.should.be.json;
			// 			res.should.have.status(200);
			// 			should.exist(res.body.data);
			// 			done();
			// 		});
			// });
				
			// it("Ingreso fecha 01-20-2019", function(done){
			// 	chai.request(server)
			// 		.post('/housingWay/')
			// 		.send({
			// 			projected_quantity: 200,
			// 			projected_date: '01-20-2019',
			// 			stage_id: 5,
			// 			partnership_id: 1,
			// 			scenario_id: 1,
			// 			breed_id: 1,
			// 			predecessor_id: 0
			// 		})
			// 		.end(function(err, res){
			// 			res.should.be.json;
			// 			res.should.have.status(200);
			// 			should.exist(res.body.data);
			// 			done();
			// 		});
			// });
				
			// it("Ingreso fecha '20 de enero de 2019'", function(done){
			// 	chai.request(server)
			// 		.post('/housingWay/')
			// 		.send({
			// 			projected_quantity: 200,
			// 			projected_date: '20 de enero de 2019',
			// 			stage_id: 5,
			// 			partnership_id: 1,
			// 			scenario_id: 1,
			// 			breed_id: 1,
			// 			predecessor_id: 0
			// 		})
			// 		.end(function(err, res){
			// 			res.should.be.json;
			// 			res.should.have.status(200);
			// 			should.exist(res.body.data);
			// 			done();
			// 		});
			// });

			// it("Ingreso fecha '20012019'", function(done){
			// 	chai.request(server)
			// 		.post('/housingWay/')
			// 		.send({
			// 			projected_quantity: 200,
			// 			projected_date: '20012019',
			// 			stage_id: 5,
			// 			partnership_id: 1,
			// 			scenario_id: 1,
			// 			breed_id: 1,
			// 			predecessor_id: 0
			// 		})
			// 		.end(function(err, res){
			// 			res.should.be.json;
			// 			res.should.have.status(200);
			// 			should.exist(res.body.data);
			// 			done();
			// 		});
			// });
				
			// it("Ingreso fecha 20-01-2019", function(done){
			// 	chai.request(server)
			// 		.post('/housingWay/')
			// 		.send({
			// 			projected_quantity: 200,
			// 			projected_date: '20-01-2019',
			// 			stage_id: 5,
			// 			partnership_id: 1,
			// 			scenario_id: 1,
			// 			breed_id: 1,
			// 			predecessor_id: 0
			// 		})
			// 		.end(function(err, res){
			// 			res.should.be.json;
			// 			res.should.have.status(200);
			// 			should.exist(res.body.data);
			// 			done();
			// 		});
			// });

		});
		
		// describe("Pruebo el metodo POST de HousingWay asociado a la ruta housingWay/findGroupByPartnership", function(done){
			
		// 	it("Busco con partnership_id valido", function(done){
		// 		chai.request(server)
		// 			.post('/housingWay/findGroupByPartnership/')
		// 			.send({
		// 				partnership_id: 1
		// 			})
		// 			.end(function(err, res){
		// 				res.should.be.json;
		// 				res.should.have.status(200);
		// 				res.body.data.should.be.a('array');
		// 				done();
		// 			});
		// 	});
			
		// 	it("Busco con partnership_id no valido", function(done){
		// 		chai.request(server)
		// 			.post('/housingWay/findGroupByPartnership/')
		// 			.send({
		// 				partnership_id: 3
		// 			})
		// 			.end(function(err, res){
		// 				res.should.be.json;
		// 				res.should.have.status(200);
		// 				res.body.data.should.be.a('array');
		// 				done();
		// 			});
		// 	});
		// });
		
		describe("Pruebo el metodo POST de HousingWay con la ruta housingWay/findHousingWByPartnership", function(done){

			// it("Pruebo con partnership_id valido", function(done){
			// 	chai.request(server)
			// 		.post('/housingWay/findHousingWByPartnership/')
			// 		.send({
			// 			partnership_id: 1
			// 		})
			// 		.end(function(err, res){
			// 			res.should.be.json;
			// 			res.should.have.status(200);
			// 			should.exist(res.body.data);
			// 			res.body.data.should.be.a('array');
			// 			assert.isAbove(res.body.data.length,0)
			// 			done();
			// 		});
			// });

			// it("Pruebo con partnership_id invalido", function(done){
			// 	chai.request(server)
			// 		.post('/housingWay/findHousingWByPartnership/')
			// 		.send({
			// 			partnership_id: 23
			// 		})
			// 		.end(function(err, res){
			// 			res.should.be.json;
			// 			res.should.have.status(200);
			// 			should.exist(res.body.data);
			// 			res.body.data.should.have.lengthOf(0)
			// 			// res.body.data.should.be.a('array');
			// 			done();
			// 		});
			// });

		});

		describe("Pruebo el metodo POST de HousingWay con la ruta housingWay/findHousingByStage", function(done){

			it("Pruebo con stage_id valido", function(done){
				chai.request(server)
					.post('/housingWay/findHousingByStage/')
					.send({
						partnership_id: 1,
						stage_id: 5, 
						scenario_id: 1
					})
					.end(function(err, res){
						res.should.be.json;
						res.should.have.status(200);
						should.exist(res.body.data);
						res.body.data.should.be.a('array');
						
						done();
					});
			});
			
			it("Pruebo con stage_id invalido", function(done){
				chai.request(server)
					.post('/housingWay/findHousingByStage/')
					.send({
						partnership_id: 1,
						stage_id: 56, 
						scenario_id: 1
					})
					.end(function(err, res){
						res.should.be.json;
						res.should.have.status(200);
						should.exist(res.body.data)
						res.body.data.should.have.lengthOf(0);
						res.body.data.should.be.a('array');
						
						done();
					});
			});

			it("Pruebo con scenario_id invalido", function(done){
				chai.request(server)
					.post('/housingWay/findHousingByStage/')
					.send({
						partnership_id: 1,
						stage_id: 1, 
						scenario_id: 15
					})
					.end(function(err, res){
						res.should.be.json;
						res.should.have.status(200);
						should.exist(res.body.data)
						res.body.data.should.have.lengthOf(0);
						res.body.data.should.be.a('array');
						
						done();
					});
			});

			it("Pruebo con partnership_id invalido", function(done){
				chai.request(server)
					.post('/housingWay/findHousingByStage/')
					.send({
						partnership_id: 15,
						stage_id: 1, 
						scenario_id: 1
					})
					.end(function(err, res){
						res.should.be.json;
						res.should.have.status(200);
						should.exist(res.body.data)
						res.body.data.should.have.lengthOf(0);
						res.body.data.should.be.a('array');
						
						done();
					});
			});

			/*Repetir para partnership_id y scenario_id, porque ambos se encuentran 
				también en la condición WHERE de la consulta */

		});

		// describe("Pruebo el metodo POST de HousingWay con la ruta housingWay/findHousingByFilters", function(done){
		// 	/*Busca los no programados */
		// 	it("Pruebo con lote nulo y programmed: true", function(done){
		// 		chai.request(server)
		// 			.post('/housingWay/findHousingByFilters/')
		// 			.send({
		// 				partnership_id: 1,
		// 				stage_id: 5, 
		// 				scenario_id: 1,
		// 				programmed: true,   /*{true, false} */
		// 				lot: null
		// 			})
		// 			.end(function(err, res){
		// 				res.should.be.json;
		// 				res.should.have.status(200);
		// 				should.exist(res.body.data);
		// 				res.body.data.should.be.a('array');
		// 				expect(res.body.data.length).to.not.equal(0)
		// 				// .should.notEqual(0);

		// 				done();
		// 			});
		// 	});
		// 	/*Busca los programados */
		// 	it("Pruebo con lote nulo y programmed: false", function(done){
		// 		chai.request(server)
		// 			.post('/housingWay/findHousingByFilters/')
		// 			.send({
		// 				partnership_id: 1,
		// 				stage_id: 5, 
		// 				scenario_id: 1,
		// 				programmed: false,   /*{true, false} */
		// 				lot: null
		// 			})
		// 			.end(function(err, res){
		// 				res.should.be.json;
		// 				res.should.have.status(200);
		// 				should.exist(res.body.data);
		// 				res.body.data.should.be.a('array');
		// 				expect(res.body.data.length).to.not.equal(0)
		// 				// .should.notEqual(0);

		// 				done();
		// 			});
		// 	});
			
		// 	it("Pruebo con lote de caracteres: 'nulo'", function(done){
		// 		chai.request(server)
		// 			.post('/housingWay/findHousingByFilters/')
		// 			.send({
		// 				partnership_id: 1,
		// 				stage_id: 5, 
		// 				scenario_id: 1,
		// 				programmed: false,   /*{true, false} */
		// 				lot: "null"
		// 			})
		// 			.end(function(err, res){
		// 				res.should.be.json;
		// 				res.should.have.status(200);
		// 				should.exist(res.body.data);
		// 				res.body.data.should.be.a('array');
		// 				expect(res.body.data.length).equal(0)
		// 				// .should.notEqual(0);

		// 				done();
		// 			});
		// 	});

		// 	it("Pruebo con lote de valor: 1", function(done){
		// 		chai.request(server)
		// 			.post('/housingWay/findHousingByFilters/')
		// 			.send({
		// 				partnership_id: 1,
		// 				stage_id: 5, 
		// 				scenario_id: 1,
		// 				programmed: false,   /*{true, false} */
		// 				lot: 1
		// 			})
		// 			.end(function(err, res){
		// 				res.should.be.json;
		// 				res.should.have.status(500);
		// 				should.not.exist(res.body.data);
		// 				// res.body.data.should.be.a('array');
		// 				// expect(res.body.data.length).equal(0)
		// 				// .should.notEqual(0);

		// 				done();
		// 			});
		// 	});

		// 	it("Pruebo con lote de valor: C1", function(done){
		// 		chai.request(server)
		// 			.post('/housingWay/findHousingByFilters/')
		// 			.send({
		// 				partnership_id: 1,
		// 				stage_id: 5, 
		// 				scenario_id: 1,
		// 				programmed: false,   /*{true, false} */
		// 				lot: "C1"
		// 			})
		// 			.end(function(err, res){
		// 				res.should.be.json;
		// 				res.should.have.status(200);
		// 				should.exist(res.body.data);
		// 				res.body.data.should.be.a('array');
		// 				expect(res.body.data.length).not.equal(0)

		// 				done();
		// 			});
		// 	});

		// });

		// describe("Pruebo el metodo POST de HousingWay con la ruta housingWay/deleteHousingWayById", function(done){

		// 	it("Ingreso un id valido", function(done){
		// 		chai.request(server)
		// 			.post('/housingWay/deleteHousingWayById/')
		// 			.send({
		// 				housing_way_id: 1203,
		// 				stage_id: 5, 
		// 				partnership_id: 1, 
		// 				scenario_id:1
		// 			})
		// 			.end(function(err, res){
		// 				res.should.be.json;
		// 				res.should.have.status(200);
		// 				should.exist(res.body.data);
		// 				res.body.data.should.be.a('array');
		// 				done();
						
		// 			});
		// 	});
				
		// 	it("Pruebo el metodo POST de HousingWay con la ruta housingWay/deleteHousingWayById usando un id invalido", function(done){
		// 		chai.request(server)
		// 		.post('/housingWay/deleteHousingWayById/')
		// 		.send({
		// 			housing_way_id: 20000,
		// 			stage_id: 5, 
		// 			partnership_id: 1, 
		// 			scenario_id:1
		// 		})
		// 		.end(function(err, res){
		// 			res.should.be.json;
		// 			res.should.have.status(500);
		// 			should.not.exist(res.body.data);
		// 			// res.body.data.should.be.a('array');
		// 			done();
		// 		});
		// 	});
		// });

		// describe("Pruebo el metodo DELETE de HousingWay/", function(done){

			
		// 	it("Pruebo con partnership_id invalido", function(done){
		// 		chai.request(server)
		// 		.delete('/housingWay/')
		// 		.send({
		// 			partnership_id: 3
		// 		})
		// 		.end(function(err, res){
		// 			res.should.be.json;
		// 			// res.should.have.status(500);
		// 			// should.not.exist(res.body.data);
		// 			res.should.have.status(200);
		// 			/*Nada de esto deberia pasar, pero pasa */
		// 			res.body.msg.should.be.a("string");
		// 			expect(res.body.msg).to.equal("Grupos elimandos con exito")
		// 			done();
		// 		});
		// 	});
			
		// 	it("Pruebo con partnership_id valido", function(done){
		// 		chai.request(server)
		// 			.delete('/housingWay/')
		// 			.send({
		// 				partnership_id: 1
		// 			})
		// 			.end(function(err, res){
		// 				res.should.be.json;
		// 				res.should.have.status(200);
		// 				res.body.msg.should.be.a("string");
		// 				expect(res.body.msg).to.equal("Grupos elimandos con exito")
		// 				done();
		// 			});
		// 	});

		// });

	});

	describe("HousingWayDetail", function(){

		describe("",function(done){});
		
	});

});

// describe('Blobs', function() {
// 	before(function() {
// 		// runs before all tests in this block
// 		console.log("before");
// 	});
// 	after(function() {
// 		// runs before all tests in this block
// 		console.log("after");
// 	});

// 	beforeEach(function() {
// 				// runs before each test in this block
// 		console.log("before each")
// 	});

// 	afterEach(function() {
// 				// runs before each test in this block
// 		console.log("after each")
// 	});
// });