/**
 * Connection form schema for Solr.
 *
 * Consumed by meadow-connection-manager#getProviderFormSchema('Solr').
 * Pure data — safe to require() in any environment.  See
 * Meadow-Connection-MySQL-FormSchema.js for the field contract.
 */
'use strict';

module.exports =
{
	Provider:    'Solr',
	DisplayName: 'Solr',
	Description: 'Connect to an Apache Solr search platform.',
	Fields:
	[
		{ Name: 'host',   Label: 'Host',     Type: 'String',  Default: 'localhost', Required: true, Placeholder: 'localhost' },
		{ Name: 'port',   Label: 'Port',     Type: 'Number',  Default: 8983,        Required: true, Min: 1, Max: 65535 },
		{ Name: 'core',   Label: 'Core',     Type: 'String',  Default: 'default',   Required: true, Placeholder: 'default' },
		{ Name: 'path',   Label: 'Path',     Type: 'String',  Default: '/solr',     Required: true, Placeholder: '/solr' },
		{ Name: 'secure', Label: 'Use HTTPS', Type: 'Boolean' }
	]
};
