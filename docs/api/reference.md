# API Reference

Complete reference for `meadow-connection-solr`.

## Service Information

| Property | Value |
|----------|-------|
| Service Type | `MeadowConnectionSolr` |
| Extends | `fable-serviceproviderbase` |
| Driver | `solr-client` ^0.9.0 |

## Connection Methods

### [connectAsync(fCallback)](connectAsync.md)

Callback-style connection method (recommended). Creates the `solr-client` instance. If already connected, returns the existing client immediately.

```javascript
_Fable.MeadowSolrProvider.connectAsync(
	(pError, pClient) =>
	{
		if (pError) { return console.error(pError); }
		// pClient is the solr-client instance
	});
```

### [connect()](connect.md)

Synchronous connection method. Creates the `solr-client` from the resolved settings. Called automatically when `MeadowConnectionSolrAutoConnect` is `true`.

```javascript
_Fable.MeadowSolrProvider.connect();
```

## Accessors

### [pool](pool.md)

Getter that returns the `solr-client` instance. Provides access to search, indexing, and document management operations.

```javascript
let tmpClient = _Fable.MeadowSolrProvider.pool;
let tmpQuery = tmpClient.query().q('Name:Luna');
tmpClient.search(tmpQuery, (pErr, pResult) =>
{
	console.log(pResult.response.docs);
});
```

## Schema Management

### [generateCreateTableStatement(pMeadowTableSchema)](generateCreateTableStatement.md)

Generates a Solr field descriptor from a Meadow table schema. Returns the descriptor without applying it.

```javascript
let tmpDescriptor = _Fable.MeadowSolrProvider.generateCreateTableStatement(tmpSchema);
// => { operation: 'schemaUpdate', collection: 'Animal', fields: [...] }
```

### [createTable(pMeadowTableSchema, fCallback)](createTable.md)

Generates and prepares a Solr schema for a collection. Validates connectivity before proceeding.

```javascript
_Fable.MeadowSolrProvider.createTable(tmpAnimalSchema,
	(pError) =>
	{
		if (pError) { console.error(pError); }
	});
```

### [createTables(pMeadowSchema, fCallback)](createTables.md)

Prepares multiple Solr schemas sequentially from a Stricture schema object.

```javascript
_Fable.MeadowSolrProvider.createTables(tmpSchema,
	(pError) =>
	{
		if (pError) { console.error(pError); }
	});
```

### [generateDropTableStatement(pTableName)](generateDropTableStatement.md)

Generates a drop collection descriptor for a Solr core.

```javascript
let tmpDrop = _Fable.MeadowSolrProvider.generateDropTableStatement('Animal');
// => { operation: 'dropCollection', collection: 'Animal' }
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `connected` | `boolean` | `true` after successful connection |
| `serviceType` | `string` | Always `'MeadowConnectionSolr'` |
| `options.Solr` | `object` | Resolved connection settings |

## Method Summary

| Method | Returns | Description |
|--------|---------|-------------|
| `connect()` | `void` | Synchronous connection |
| `connectAsync(fCallback)` | `void` | Callback-style connection |
| `pool` | `solr-client` / `false` | Solr client instance |
| `generateCreateTableStatement(schema)` | `object` | Field descriptor |
| `createTable(schema, fCallback)` | `void` | Prepare schema for a collection |
| `createTables(schema, fCallback)` | `void` | Prepare multiple schemas |
| `generateDropTableStatement(name)` | `object` | Drop collection descriptor |
