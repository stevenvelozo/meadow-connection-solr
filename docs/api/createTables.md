# createTables(pMeadowSchema, fCallback)

Prepares multiple Solr schema descriptors sequentially from a Stricture schema object.

## Signature

```javascript
createTables(pMeadowSchema, fCallback)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pMeadowSchema` | `object` | Schema with a `Tables` array of Meadow table schemas |
| `fCallback` | `function` | Callback receiving `(error)` |

## Return Value

Returns the result of the callback invocation.

## Behavior

1. Iterates over `pMeadowSchema.Tables` using `fable.Utility.eachLimit` with concurrency of 1
2. Calls `this.createTable(table, callback)` for each table
3. On completion: logs info, calls `fCallback()` with no error
4. On error: logs the error, calls `fCallback(pError)`

## Basic Usage

```javascript
let tmpSchema =
{
	Tables:
	[
		{
			TableName: 'Animal',
			Columns:
			[
				{ Column: 'IDAnimal', DataType: 'ID' },
				{ Column: 'GUIDAnimal', DataType: 'GUID' },
				{ Column: 'Name', DataType: 'String' },
				{ Column: 'IDFarm', DataType: 'ForeignKey' }
			]
		},
		{
			TableName: 'Farm',
			Columns:
			[
				{ Column: 'IDFarm', DataType: 'ID' },
				{ Column: 'GUIDFarm', DataType: 'GUID' },
				{ Column: 'FarmName', DataType: 'String' }
			]
		}
	]
};

_Fable.MeadowSolrProvider.createTables(tmpSchema,
	(pError) =>
	{
		if (pError)
		{
			console.error('Schema preparation failed:', pError);
			return;
		}
		console.log('All schemas prepared!');
	});
```

## Sequential Processing

Schemas are prepared one at a time (concurrency of 1) using `fable.Utility.eachLimit`. This ensures:

- Deterministic processing order
- Clear log output showing each collection as it is prepared
- Predictable error reporting -- the first failure stops the sequence

## Error Handling

If any schema preparation fails, the error is passed to the callback and remaining schemas are skipped:

```javascript
_Fable.MeadowSolrProvider.createTables(tmpSchema,
	(pError) =>
	{
		if (pError)
		{
			// Only the first error is reported
			console.error('Failed during schema preparation:', pError);
		}
	});
```

## Application Startup Pattern

```javascript
_Fable.MeadowSolrProvider.connectAsync(
	(pError) =>
	{
		if (pError) { return console.error(pError); }

		_Fable.MeadowSolrProvider.createTables(appSchema,
			(pSchemaError) =>
			{
				if (pSchemaError) { return console.error(pSchemaError); }
				console.log('Solr schemas ready -- starting application');
				startApp();
			});
	});
```

## Related

- [createTable](createTable.md) -- Prepare a single schema
- [generateCreateTableStatement](generateCreateTableStatement.md) -- Generate a descriptor
- [Schema & Field Types](../schema.md) -- Full type mapping reference
