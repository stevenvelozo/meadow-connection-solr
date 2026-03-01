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
						var tmpFable = new libFable({Product:'SolrConnectionTest', Solr:{Server:'localhost', Port:8983}});
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
						var tmpFable = new libFable({Product:'SolrConnectionTest', Solr:{Server:'localhost', Port:8983}});
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
	}
);
