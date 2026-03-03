/**
* Unit tests for Meadow Solr Connection
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require('chai');
var Expect = Chai.expect;

var libFable = require('fable');
var libMeadowConnectionSolr = require('../source/Meadow-Connection-Solr.js');

var _FableConfig = (
	{
		"Product": "MeadowSolrConnectionTest",
		"ProductVersion": "1.0.0",

		"UUID":
			{
				"DataCenter": 0,
				"Worker": 0
			},
		"LogStreams":
			[
				{
					"streamtype": "console"
				}
			],

		"Solr":
			{
				"Server": "127.0.0.1",
				"Port": 18983,
				"Core": "meadow_conn_test"
			}
	});

var _AnimalSchema = {
	TableName: 'Animal',
	Columns: [
		{ Column: 'IDAnimal', DataType: 'ID' },
		{ Column: 'GUIDAnimal', DataType: 'GUID' },
		{ Column: 'Name', DataType: 'String' },
		{ Column: 'Age', DataType: 'Numeric' },
		{ Column: 'Weight', DataType: 'Decimal' },
		{ Column: 'Description', DataType: 'Text' },
		{ Column: 'Birthday', DataType: 'DateTime' },
		{ Column: 'Active', DataType: 'Boolean' },
		{ Column: 'IDFarm', DataType: 'ForeignKey' }
	]
};

var _VehicleSchema = {
	TableName: 'Vehicle',
	Columns: [
		{ Column: 'IDVehicle', DataType: 'ID' },
		{ Column: 'GUIDVehicle', DataType: 'GUID' },
		{ Column: 'Make', DataType: 'String' },
		{ Column: 'Model', DataType: 'String' },
		{ Column: 'Year', DataType: 'Numeric' }
	]
};

suite
(
	'Meadow-Connection-Solr',
	function()
	{
		suite
		(
			'Object Sanity',
			function()
			{
				test
				(
					'The class should initialize',
					function()
					{
						var tmpFable = new libFable({Product:'SolrConnectionTest', Solr:{Server:'localhost', Port:8983, Core:'testcore'}});
						tmpFable.serviceManager.addServiceType('MeadowProvider', libMeadowConnectionSolr);
						var tmpProvider = tmpFable.serviceManager.instantiateServiceProvider('MeadowProvider');
						Expect(tmpProvider).to.be.an('object');
						Expect(tmpProvider.serviceType).to.equal('MeadowConnectionSolr');
						Expect(tmpProvider.connected).to.equal(false);
					}
				);
			}
		);

		suite
		(
			'Configuration',
			function()
			{
				test
				(
					'use default settings from fable.settings',
					function()
					{
						var tmpFable = new libFable({Product:'SolrConnectionTest', Solr:{Server:'solr.example.com', Port:8984, Core:'mycore'}});
						tmpFable.serviceManager.addServiceType('MeadowProvider', libMeadowConnectionSolr);
						var tmpProvider = tmpFable.serviceManager.instantiateServiceProvider('MeadowProvider');
						Expect(tmpProvider.options.Solr.host).to.equal('solr.example.com');
						Expect(tmpProvider.options.Solr.port).to.equal(8984);
						Expect(tmpProvider.options.Solr.core).to.equal('mycore');
					}
				);
				test
				(
					'use pass-in options with Meadow-style property names',
					function()
					{
						var tmpFable = new libFable({Product:'SolrConnectionTest'});
						tmpFable.serviceManager.addServiceType('MeadowProvider', libMeadowConnectionSolr);
						var tmpProvider = tmpFable.serviceManager.instantiateServiceProvider('MeadowProvider',
						{
							Solr: { Server: 'my-solr.local', Port: 9999, Core: 'custom', Path: '/solr', Secure: true }
						});
						Expect(tmpProvider.options.Solr.host).to.equal('my-solr.local');
						Expect(tmpProvider.options.Solr.port).to.equal(9999);
						Expect(tmpProvider.options.Solr.core).to.equal('custom');
						Expect(tmpProvider.options.Solr.path).to.equal('/solr');
						Expect(tmpProvider.options.Solr.secure).to.equal(true);
					}
				);
			}
		);

		suite
		(
			'DDL Generation',
			function()
			{
				test
				(
					'generate a Solr field schema descriptor for a table',
					function()
					{
						var tmpFable = new libFable(_FableConfig);
						tmpFable.serviceManager.addServiceType('MeadowProvider', libMeadowConnectionSolr);
						var tmpProvider = tmpFable.serviceManager.instantiateServiceProvider('MeadowProvider');

						var tmpResult = tmpProvider.generateCreateTableStatement(
						{
							TableName: 'Animal',
							Columns: [
								{ Column: 'IDAnimal', DataType: 'ID' },
								{ Column: 'GUIDAnimal', DataType: 'GUID' },
								{ Column: 'Name', DataType: 'String' },
								{ Column: 'Age', DataType: 'Numeric' },
								{ Column: 'Weight', DataType: 'Decimal' },
								{ Column: 'CreateDate', DataType: 'DateTime' },
								{ Column: 'Deleted', DataType: 'Boolean' },
								{ Column: 'Description', DataType: 'Text' },
								{ Column: 'IDFarm', DataType: 'ForeignKey' }
							]
						});

						Expect(tmpResult.operation).to.equal('schemaUpdate');
						Expect(tmpResult.collection).to.equal('Animal');
						Expect(tmpResult.fields).to.be.an('array');
						// Check each field mapping
						var tmpFieldMap = {};
						for (var i = 0; i < tmpResult.fields.length; i++)
						{
							tmpFieldMap[tmpResult.fields[i].name] = tmpResult.fields[i].type;
						}
						Expect(tmpFieldMap.IDAnimal).to.equal('pint');
						Expect(tmpFieldMap.GUIDAnimal).to.equal('string');
						Expect(tmpFieldMap.Name).to.equal('string');
						Expect(tmpFieldMap.Age).to.equal('pint');
						Expect(tmpFieldMap.Weight).to.equal('pfloat');
						Expect(tmpFieldMap.CreateDate).to.equal('pdate');
						Expect(tmpFieldMap.Deleted).to.equal('pint');
						Expect(tmpFieldMap.Description).to.equal('text_general');
						Expect(tmpFieldMap.IDFarm).to.equal('pint');
					}
				);
				test
				(
					'generate a drop collection descriptor',
					function()
					{
						var tmpFable = new libFable(_FableConfig);
						tmpFable.serviceManager.addServiceType('MeadowProvider', libMeadowConnectionSolr);
						var tmpProvider = tmpFable.serviceManager.instantiateServiceProvider('MeadowProvider');

						var tmpResult = tmpProvider.generateDropTableStatement('Animal');
						Expect(tmpResult.operation).to.equal('dropCollection');
						Expect(tmpResult.collection).to.equal('Animal');
					}
				);
			}
		);

		suite
		(
			'Connection URL',
			function()
			{
				test
				(
					'build connection URL without secure',
					function()
					{
						var tmpFable = new libFable({Product:'SolrConnectionTest', Solr:{Server:'solr.example.com', Port:8983, Core:'testcore'}});
						tmpFable.serviceManager.addServiceType('MeadowProvider', libMeadowConnectionSolr);
						var tmpProvider = tmpFable.serviceManager.instantiateServiceProvider('MeadowProvider');
						Expect(tmpProvider._buildConnectionURL()).to.equal('http://solr.example.com:8983/solr/testcore');
					}
				);
				test
				(
					'build connection URL with secure',
					function()
					{
						var tmpFable = new libFable({Product:'SolrConnectionTest'});
						tmpFable.serviceManager.addServiceType('MeadowProvider', libMeadowConnectionSolr);
						var tmpProvider = tmpFable.serviceManager.instantiateServiceProvider('MeadowProvider',
						{
							Solr: { Server: 'secure-solr.example.com', Port: 8984, Core: 'prodcore', Secure: true }
						});
						Expect(tmpProvider._buildConnectionURL()).to.equal('https://secure-solr.example.com:8984/solr/prodcore');
					}
				);
				test
				(
					'build connection URL with default settings',
					function()
					{
						var tmpFable = new libFable({Product:'SolrConnectionTest', Solr:{Server:'localhost'}});
						tmpFable.serviceManager.addServiceType('MeadowProvider', libMeadowConnectionSolr);
						var tmpProvider = tmpFable.serviceManager.instantiateServiceProvider('MeadowProvider');
						Expect(tmpProvider._buildConnectionURL()).to.equal('http://localhost:8983/solr/default');
					}
				);
			}
		);

		suite
		(
			'Connection',
			function()
			{
				test
				(
					'connect with default fable.settings',
					function(fDone)
					{
						var tmpFable = new libFable(_FableConfig);
						tmpFable.serviceManager.addServiceType('MeadowSolrProvider', libMeadowConnectionSolr);
						tmpFable.serviceManager.instantiateServiceProvider('MeadowSolrProvider');

						Expect(tmpFable.MeadowSolrProvider.connected).to.equal(false);

						tmpFable.MeadowSolrProvider.connect();

						Expect(tmpFable.MeadowSolrProvider.connected).to.equal(true);
						Expect(tmpFable.MeadowSolrProvider.pool).to.be.an('object');

						// Verify we can actually communicate with Solr
						tmpFable.MeadowSolrProvider.pool.ping(
							function(pError, pResult)
							{
								Expect(pError).to.equal(null);
								Expect(pResult).to.be.an('object');
								Expect(pResult.status).to.equal('OK');
								return fDone();
							});
					}
				);
				test
				(
					'connectAsync callback',
					function(fDone)
					{
						var tmpFable = new libFable(_FableConfig);
						tmpFable.serviceManager.addServiceType('MeadowSolrProvider', libMeadowConnectionSolr);
						tmpFable.serviceManager.instantiateServiceProvider('MeadowSolrProvider');

						tmpFable.MeadowSolrProvider.connectAsync(
							function(pError, pClient)
							{
								Expect(pError).to.equal(null);
								Expect(pClient).to.be.an('object');
								Expect(tmpFable.MeadowSolrProvider.connected).to.equal(true);
								Expect(tmpFable.MeadowSolrProvider.pool).to.equal(pClient);

								return fDone();
							});
					}
				);
				test
				(
					'autoconnect via MeadowConnectionSolrAutoConnect',
					function(fDone)
					{
						var tmpConfig = JSON.parse(JSON.stringify(_FableConfig));
						tmpConfig.MeadowConnectionSolrAutoConnect = true;

						var tmpFable = new libFable(tmpConfig);
						tmpFable.serviceManager.addAndInstantiateServiceType('MeadowSolrProvider', libMeadowConnectionSolr);

						Expect(tmpFable.MeadowSolrProvider.connected).to.equal(true);
						Expect(tmpFable.MeadowSolrProvider.pool).to.be.an('object');

						tmpFable.MeadowSolrProvider.pool.ping(
							function(pError, pResult)
							{
								Expect(pError).to.equal(null);
								Expect(pResult.status).to.equal('OK');
								return fDone();
							});
					}
				);
				test
				(
					'connect when already connected logs error and does not throw',
					function()
					{
						var tmpFable = new libFable(_FableConfig);
						tmpFable.serviceManager.addServiceType('MeadowSolrProvider', libMeadowConnectionSolr);
						tmpFable.serviceManager.instantiateServiceProvider('MeadowSolrProvider');

						tmpFable.MeadowSolrProvider.connect();
						Expect(tmpFable.MeadowSolrProvider.connected).to.equal(true);

						// Second connect should not throw
						tmpFable.MeadowSolrProvider.connect();
						Expect(tmpFable.MeadowSolrProvider.connected).to.equal(true);
					}
				);
				test
				(
					'pass in your own settings and connect',
					function(fDone)
					{
						var tmpFable = new libFable();
						tmpFable.serviceManager.addServiceType('MeadowSolrProvider', libMeadowConnectionSolr);
						tmpFable.serviceManager.instantiateServiceProvider('MeadowSolrProvider', {Solr: _FableConfig.Solr});

						tmpFable.MeadowSolrProvider.connect();

						Expect(tmpFable.MeadowSolrProvider.connected).to.equal(true);

						tmpFable.MeadowSolrProvider.pool.ping(
							function(pError, pResult)
							{
								Expect(pError).to.equal(null);
								Expect(pResult.status).to.equal('OK');
								return fDone();
							});
					}
				);
			}
		);

		suite
		(
			'Schema Execution',
			function()
			{
				var _Fable = null;

				suiteSetup
				(
					function(fDone)
					{
						_Fable = new libFable(_FableConfig);
						_Fable.serviceManager.addServiceType('MeadowSolrProvider', libMeadowConnectionSolr);
						_Fable.serviceManager.instantiateServiceProvider('MeadowSolrProvider');
						_Fable.MeadowSolrProvider.connect();
						fDone();
					}
				);

				test
				(
					'createTable calls back without error when connected',
					function(fDone)
					{
						_Fable.MeadowSolrProvider.createTable(_AnimalSchema,
							function(pError)
							{
								Expect(pError).to.not.be.an('error');
								return fDone();
							});
					}
				);
				test
				(
					'createTables processes multiple schemas',
					function(fDone)
					{
						var tmpMultiSchema = {
							Tables: [_AnimalSchema, _VehicleSchema]
						};

						_Fable.MeadowSolrProvider.createTables(tmpMultiSchema,
							function(pError)
							{
								Expect(pError).to.not.be.an('error');
								return fDone();
							});
					}
				);
				test
				(
					'createTable when not connected returns error',
					function(fDone)
					{
						// Create a disconnected provider (no connect() call)
						var tmpFable = new libFable(_FableConfig);
						tmpFable.serviceManager.addServiceType('MeadowSolrProvider', libMeadowConnectionSolr);
						tmpFable.serviceManager.instantiateServiceProvider('MeadowSolrProvider');

						tmpFable.MeadowSolrProvider.createTable(_AnimalSchema,
							function(pError)
							{
								Expect(pError).to.be.an('error');
								Expect(pError.message).to.contain('Not connected');
								return fDone();
							});
					}
				);
			}
		);

		suite
		(
			'Raw Solr Operations',
			function()
			{
				var _Fable = null;

				suiteSetup
				(
					function(fDone)
					{
						_Fable = new libFable(_FableConfig);
						_Fable.serviceManager.addServiceType('MeadowSolrProvider', libMeadowConnectionSolr);
						_Fable.serviceManager.instantiateServiceProvider('MeadowSolrProvider');
						_Fable.MeadowSolrProvider.connect();

						// Clear any existing documents before starting
						_Fable.MeadowSolrProvider.pool.deleteAll(
							function(pError)
							{
								if (pError)
								{
									return fDone(pError);
								}
								_Fable.MeadowSolrProvider.pool.commit(
									function(pCommitError)
									{
										return fDone(pCommitError);
									});
							});
					}
				);

				suiteTeardown
				(
					function(fDone)
					{
						// Clean up all documents
						_Fable.MeadowSolrProvider.pool.deleteAll(
							function(pError)
							{
								if (pError)
								{
									return fDone(pError);
								}
								_Fable.MeadowSolrProvider.pool.commit(
									function(pCommitError)
									{
										return fDone(pCommitError);
									});
							});
					}
				);

				test
				(
					'add and search documents',
					function(fDone)
					{
						var tmpClient = _Fable.MeadowSolrProvider.pool;

						var tmpDocs = [
							{ id: 'animal-1', IDAnimal: 1, Name: 'Fido', Type: 'Dog', Age: 5 },
							{ id: 'animal-2', IDAnimal: 2, Name: 'Whiskers', Type: 'Cat', Age: 3 },
							{ id: 'animal-3', IDAnimal: 3, Name: 'Polly', Type: 'Parrot', Age: 7 }
						];

						tmpClient.add(tmpDocs,
							function(pAddError)
							{
								Expect(pAddError).to.equal(null);

								tmpClient.commit(
									function(pCommitError)
									{
										Expect(pCommitError).to.equal(null);

										var tmpQuery = tmpClient.query().q('*:*').sort({ IDAnimal: 'asc' }).rows(10);
										tmpClient.search(tmpQuery,
											function(pSearchError, pResult)
											{
												Expect(pSearchError).to.equal(null);
												Expect(pResult).to.be.an('object');
												Expect(pResult.response.numFound).to.equal(3);
												Expect(pResult.response.docs[0].Name).to.equal('Fido');
												Expect(pResult.response.docs[1].Name).to.equal('Whiskers');
												Expect(pResult.response.docs[2].Name).to.equal('Polly');
												return fDone();
											});
									});
							});
					}
				);
				test
				(
					'search with filter query',
					function(fDone)
					{
						var tmpClient = _Fable.MeadowSolrProvider.pool;

						var tmpQuery = tmpClient.query().q('Type:Dog');
						tmpClient.search(tmpQuery,
							function(pSearchError, pResult)
							{
								Expect(pSearchError).to.equal(null);
								Expect(pResult.response.numFound).to.equal(1);
								Expect(pResult.response.docs[0].Name).to.equal('Fido');
								Expect(pResult.response.docs[0].Type).to.equal('Dog');
								return fDone();
							});
					}
				);
				test
				(
					'delete a document by query',
					function(fDone)
					{
						var tmpClient = _Fable.MeadowSolrProvider.pool;

						tmpClient.delete('id', 'animal-3',
							function(pDeleteError)
							{
								Expect(pDeleteError).to.equal(null);

								tmpClient.commit(
									function(pCommitError)
									{
										Expect(pCommitError).to.equal(null);

										var tmpQuery = tmpClient.query().q('*:*');
										tmpClient.search(tmpQuery,
											function(pSearchError, pResult)
											{
												Expect(pSearchError).to.equal(null);
												Expect(pResult.response.numFound).to.equal(2);
												return fDone();
											});
									});
							});
					}
				);
				test
				(
					'delete all and verify empty',
					function(fDone)
					{
						var tmpClient = _Fable.MeadowSolrProvider.pool;

						tmpClient.deleteAll(
							function(pDeleteError)
							{
								Expect(pDeleteError).to.equal(null);

								tmpClient.commit(
									function(pCommitError)
									{
										Expect(pCommitError).to.equal(null);

										var tmpQuery = tmpClient.query().q('*:*');
										tmpClient.search(tmpQuery,
											function(pSearchError, pResult)
											{
												Expect(pSearchError).to.equal(null);
												Expect(pResult.response.numFound).to.equal(0);
												return fDone();
											});
									});
							});
					}
				);
			}
		);
	}
);
