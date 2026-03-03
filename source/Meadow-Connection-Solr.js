/**
* Meadow Solr Provider Fable Service
* @author Steven Velozo <steven@velozo.com>
*/
const libFableServiceProviderBase = require('fable-serviceproviderbase');

const libMeadowSchemaSolr = require('./Meadow-Schema-Solr.js');

let libSolr = false;
try
{
	libSolr = require('solr-client');
}
catch(pError)
{
	// solr-client not available; connection will fail gracefully
}

class MeadowConnectionSolr extends libFableServiceProviderBase
{
	constructor(pFable, pManifest, pServiceHash)
	{
		super(pFable, pManifest, pServiceHash);

		this.serviceType = 'MeadowConnectionSolr';

		// See if the user passed in a Solr object already
		if (typeof(this.options.Solr) == 'object')
		{
			// Support Meadow-style property names
			if (!this.options.Solr.hasOwnProperty('host') && this.options.Solr.hasOwnProperty('Server'))
			{
				this.options.Solr.host = this.options.Solr.Server;
			}
			if (!this.options.Solr.hasOwnProperty('port') && this.options.Solr.hasOwnProperty('Port'))
			{
				this.options.Solr.port = this.options.Solr.Port;
			}
			if (!this.options.Solr.hasOwnProperty('core') && this.options.Solr.hasOwnProperty('Core'))
			{
				this.options.Solr.core = this.options.Solr.Core;
			}
			if (!this.options.Solr.hasOwnProperty('path') && this.options.Solr.hasOwnProperty('Path'))
			{
				this.options.Solr.path = this.options.Solr.Path;
			}
			if (!this.options.Solr.hasOwnProperty('secure') && this.options.Solr.hasOwnProperty('Secure'))
			{
				this.options.Solr.secure = this.options.Solr.Secure;
			}
		}
		else if (typeof(this.fable.settings.Solr) == 'object')
		{
			this.options.Solr = (
				{
					host: this.fable.settings.Solr.Server || 'localhost',
					port: this.fable.settings.Solr.Port || 8983,
					core: this.fable.settings.Solr.Core || 'default',
					path: this.fable.settings.Solr.Path || '/solr',
					secure: this.fable.settings.Solr.Secure || false
				});
		}

		if (!this.options.MeadowConnectionSolrAutoConnect)
		{
			this.options.MeadowConnectionSolrAutoConnect = this.fable.settings.MeadowConnectionSolrAutoConnect;
		}

		this._Client = false;
		this.connected = false;

		// Schema provider handles DDL operations (create, drop, index, etc.)
		this._SchemaProvider = new libMeadowSchemaSolr(this.fable, this.options, `${this.Hash}-Schema`);

		if (this.options.MeadowConnectionSolrAutoConnect)
		{
			this.connect();
		}
	}

	get schemaProvider()
	{
		return this._SchemaProvider;
	}

	/**
	* Build the Solr HTTP endpoint URL from options.
	*/
	_buildConnectionURL()
	{
		let tmpOptions = this.options.Solr || {};
		let tmpHost = tmpOptions.host || 'localhost';
		let tmpPort = tmpOptions.port || 8983;
		let tmpSecure = tmpOptions.secure || false;
		let tmpPath = tmpOptions.path || '/solr';
		let tmpCore = tmpOptions.core || 'default';

		let tmpProtocol = tmpSecure ? 'https' : 'http';
		return `${tmpProtocol}://${tmpHost}:${tmpPort}${tmpPath}/${tmpCore}`;
	}

	generateDropTableStatement(pTableName)
	{
		return this._SchemaProvider.generateDropTableStatement(pTableName);
	}

	generateCreateTableStatement(pMeadowTableSchema)
	{
		return this._SchemaProvider.generateCreateTableStatement(pMeadowTableSchema);
	}

	createTables(pMeadowSchema, fCallback)
	{
		return this._SchemaProvider.createTables(pMeadowSchema, fCallback);
	}

	createTable(pMeadowTableSchema, fCallback)
	{
		return this._SchemaProvider.createTable(pMeadowTableSchema, fCallback);
	}

	connect()
	{
		if (this._Client)
		{
			this.log.error(`Meadow-Connection-Solr trying to connect but is already connected - skipping.`);
			return;
		}

		if (!libSolr)
		{
			this.log.error(`Meadow-Connection-Solr: solr-client is not installed.`);
			return;
		}

		let tmpOptions = this.options.Solr || {};

		let tmpURL = this._buildConnectionURL();
		this.fable.log.info(`Meadow-Connection-Solr connecting to [${tmpURL}]`);

		this._Client = libSolr.createClient(
			{
				host: tmpOptions.host || 'localhost',
				port: tmpOptions.port || 8983,
				core: tmpOptions.core || 'default',
				path: tmpOptions.path || '/solr',
				secure: tmpOptions.secure || false
			});

		this.connected = true;
		this._SchemaProvider.setClient(this._Client);
	}

	connectAsync(fCallback)
	{
		let tmpCallback = fCallback;
		if (typeof (tmpCallback) !== 'function')
		{
			this.log.error(`Meadow Solr connectAsync() called without a callback.`);
			tmpCallback = () => { };
		}

		try
		{
			if (this._Client)
			{
				return tmpCallback(null, this._Client);
			}
			else
			{
				this.connect();
				return tmpCallback(null, this._Client);
			}
		}
		catch(pError)
		{
			this.log.error(`Meadow Solr connectAsync() error: ${pError}`, pError);
			return tmpCallback(pError);
		}
	}

	/**
	* Returns the Solr client instance (analogous to pool in SQL drivers).
	*/
	get pool()
	{
		return this._Client;
	}
}

module.exports = MeadowConnectionSolr;
