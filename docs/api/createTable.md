# createTable(pMeadowTableSchema, fCallback)

Generates a Solr schema descriptor from a Meadow table schema and validates connectivity. Logs the prepared schema for the collection.

## Signature

```javascript
createTable(pMeadowTableSchema, fCallback)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pMeadowTableSchema` | `object` | Meadow table schema with `TableName` and `Columns` array |
| `fCallback` | `function` | Callback receiving `(error)` |

## Return Value

Returns the result of the callback invocation.

## Behavior

1. Calls `generateCreateTableStatement(pMeadowTableSchema)` to build the field descriptor
2. Validates that the client is connected (`this._Client`)
3. Logs the prepared schema information (collection name and field count)
4. Calls `fCallback()` with no error on success

## Basic Usage

```javascript
let tmpAnimalSchema =
{
	TableName: 'Animal',
	Columns:
	[
		{ Column: 'IDAnimal', DataType: 'ID' },
		{ Column: 'GUIDAnimal', DataType: 'GUID' },
		{ Column: 'Name', DataType: 'String' },
		{ Column: 'Age', DataType: 'Numeric' },
		{ Column: 'Weight', DataType: 'Decimal' }
	]
};

_Fable.MeadowSolrProvider.createTable(tmpAnimalSchema,
	(pError) =>
	{
		if (pError)
		{
			console.error('Schema preparation failed:', pError);
			return;
		}
		console.log('Animal schema prepared!');
	});
```

## Not Connected

If the client is not connected, the callback receives an error immediately:

```javascript
// Before connecting
_Fable.MeadowSolrProvider.createTable(tmpSchema,
	(pError) =>
	{
		// pError: Error('Not connected to Solr')
	});
```

## Prerequisites

The connection must be established before calling `createTable()`:

```javascript
_Fable.MeadowSolrProvider.connectAsync(
	(pError) =>
	{
		if (pError) { return; }

		_Fable.MeadowSolrProvider.createTable(tmpAnimalSchema,
			(pCreateError) =>
			{
				if (pCreateError) { console.error(pCreateError); }
			});
	});
```

## Related

- [generateCreateTableStatement](generateCreateTableStatement.md) -- Generate descriptor without preparing
- [createTables](createTables.md) -- Prepare multiple schemas sequentially
- [generateDropTableStatement](generateDropTableStatement.md) -- Generate drop descriptor
- [Schema & Field Types](../schema.md) -- Full type mapping reference
