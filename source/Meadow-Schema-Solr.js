/**
* Meadow Solr Schema Provider
*
* Handles collection creation, dropping, and schema generation for Solr.
* Separated from the connection provider to allow independent extension
* for indexing and other schema operations.
*
* @author Steven Velozo <steven@velozo.com>
*/
const libFableServiceProviderBase = require('fable-serviceproviderbase');

class MeadowSchemaSolr extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'MeadowSchemaSolr';

		// Reference to the Solr client, set by the connection provider
		this._Client = false;
	}

	/**
	 * Set the client reference for executing schema operations.
	 * @param {object} pClient - Solr client instance
	 * @returns {MeadowSchemaSolr} this (for chaining)
	 */
	setClient(pClient)
	{
		this._Client = pClient;
		return this;
	}

	generateDropTableStatement(pTableName)
	{
		// Returns a descriptor for dropping a Solr collection
		return { operation: 'dropCollection', collection: pTableName };
	}

	generateCreateTableStatement(pMeadowTableSchema)
	{
		this.log.info(`--> Building the Solr schema for ${pMeadowTableSchema.TableName} ...`);

		let tmpFields = [];

		for (let j = 0; j < pMeadowTableSchema.Columns.length; j++)
		{
			let tmpColumn = pMeadowTableSchema.Columns[j];
			let tmpFieldName = tmpColumn.Column;
			let tmpFieldType = 'string';

			switch (tmpColumn.DataType)
			{
				case 'ID':
					tmpFieldType = 'pint';
					break;
				case 'GUID':
					tmpFieldType = 'string';
					break;
				case 'ForeignKey':
					tmpFieldType = 'pint';
					break;
				case 'Numeric':
					tmpFieldType = 'pint';
					break;
				case 'Decimal':
					tmpFieldType = 'pfloat';
					break;
				case 'String':
					tmpFieldType = 'string';
					break;
				case 'Text':
					tmpFieldType = 'text_general';
					break;
				case 'DateTime':
					tmpFieldType = 'pdate';
					break;
				case 'Boolean':
					tmpFieldType = 'pint';
					break;
				default:
					tmpFieldType = 'string';
					break;
			}

			tmpFields.push({ name: tmpFieldName, type: tmpFieldType });
		}

		return {
			operation: 'schemaUpdate',
			collection: pMeadowTableSchema.TableName,
			fields: tmpFields
		};
	}

	createTables(pMeadowSchema, fCallback)
	{
		this.fable.Utility.eachLimit(pMeadowSchema.Tables, 1,
			(pTable, fCreateComplete) =>
			{
				return this.createTable(pTable, fCreateComplete);
			},
			(pCreateError) =>
			{
				if (pCreateError)
				{
					this.log.error(`Meadow-Solr Error creating schemas: ${pCreateError}`, pCreateError);
				}
				this.log.info('Done creating Solr schemas!');
				return fCallback(pCreateError);
			});
	}

	createTable(pMeadowTableSchema, fCallback)
	{
		let tmpDescriptor = this.generateCreateTableStatement(pMeadowTableSchema);

		if (!this._Client)
		{
			this.log.error(`Meadow-Solr CREATE SCHEMA for ${tmpDescriptor.collection} failed: not connected.`);
			return fCallback(new Error('Not connected to Solr'));
		}

		// For Solr, schema updates are done via the Schema API
		// This would typically be a POST to /solr/<collection>/schema
		this.log.info(`Meadow-Solr schema for ${tmpDescriptor.collection} prepared (${tmpDescriptor.fields.length} fields).`);
		return fCallback();
	}
}

module.exports = MeadowSchemaSolr;
