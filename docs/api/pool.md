# pool (getter)

Returns the `solr-client` instance for search, indexing, and document operations.

## Signature

```javascript
get pool()
```

## Return Value

| Type | Description |
|------|-------------|
| `solr-client` | The Solr client instance (after connecting) |
| `false` | Before connection |

## Primary Use

The `pool` getter is the main entry point for all Solr operations. The name `pool` provides API symmetry with SQL-based Meadow connectors, even though the Solr client is an HTTP client rather than a connection pool.

```javascript
let tmpClient = _Fable.MeadowSolrProvider.pool;
```

## Search Example

```javascript
let tmpClient = _Fable.MeadowSolrProvider.pool;

// Build a query
let tmpQuery = tmpClient.query().q('Name:Luna');

// Execute the search
tmpClient.search(tmpQuery,
	(pError, pResult) =>
	{
		if (pError) { return console.error(pError); }
		console.log('Found:', pResult.response.numFound);
		console.log('Documents:', pResult.response.docs);
	});
```

## Search with Filters

```javascript
let tmpClient = _Fable.MeadowSolrProvider.pool;

let tmpQuery = tmpClient.query()
	.q('Description:friendly')
	.fq({ field: 'Deleted', value: 0 })
	.start(0)
	.rows(10)
	.sort({ Age: 'desc' });

tmpClient.search(tmpQuery,
	(pError, pResult) =>
	{
		if (pError) { return console.error(pError); }
		console.log(pResult.response.docs);
	});
```

## Add Documents

```javascript
let tmpClient = _Fable.MeadowSolrProvider.pool;

// Add a single document
tmpClient.add(
	{
		IDAnimal: 1,
		GUIDAnimal: '550e8400-e29b-41d4-a716-446655440000',
		Name: 'Luna',
		Age: 5,
		Weight: 4.5,
		Description: 'A friendly tabby cat'
	},
	(pError, pResult) =>
	{
		if (pError) { return console.error(pError); }
		console.log('Document added');
	});
```

## Commit Changes

Solr requires an explicit commit to make indexed documents searchable:

```javascript
let tmpClient = _Fable.MeadowSolrProvider.pool;

tmpClient.commit(
	(pError, pResult) =>
	{
		if (pError) { return console.error(pError); }
		console.log('Changes committed');
	});
```

## Delete Documents

```javascript
let tmpClient = _Fable.MeadowSolrProvider.pool;

// Delete by ID
tmpClient.deleteByID('1',
	(pError, pResult) =>
	{
		if (pError) { return console.error(pError); }
		tmpClient.commit();
	});

// Delete by query
tmpClient.deleteByQuery('Deleted:1',
	(pError, pResult) =>
	{
		if (pError) { return console.error(pError); }
		tmpClient.commit();
	});
```

## Client Methods

| Method | Description |
|--------|-------------|
| `client.query()` | Create a new query builder |
| `client.search(query, callback)` | Execute a search query |
| `client.add(doc, callback)` | Add a document to the index |
| `client.commit(callback)` | Commit pending changes |
| `client.deleteByID(id, callback)` | Delete a document by ID |
| `client.deleteByQuery(query, callback)` | Delete documents matching a query |
| `client.optimize(callback)` | Optimize the index |
| `client.ping(callback)` | Ping the Solr server |

## Query Builder Methods

| Method | Description |
|--------|-------------|
| `.q(query)` | Set the main query string |
| `.fq(filter)` | Add a filter query |
| `.start(offset)` | Set the start offset |
| `.rows(count)` | Set the number of rows to return |
| `.sort(spec)` | Set sort order |
| `.fl(fields)` | Set fields to return |
| `.facet(options)` | Enable faceting |
| `.hl(options)` | Enable highlighting |

## Before Connection

Returns `false` before `connect()` or `connectAsync()` is called:

```javascript
let tmpClient = _Fable.MeadowSolrProvider.pool;
// tmpClient => false (not connected yet)
```

Always check `connected` before using `pool`:

```javascript
if (!_Fable.MeadowSolrProvider.connected)
{
	console.error('Not connected to Solr.');
	return;
}

let tmpClient = _Fable.MeadowSolrProvider.pool;
```

## Related

- [connectAsync](connectAsync.md) -- Establish the connection
- [connect](connect.md) -- Synchronous connection
