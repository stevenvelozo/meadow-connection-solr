# generateCreateTableStatement(pMeadowTableSchema)

Generates a Solr field descriptor from a Meadow table schema. Returns the descriptor without applying it to the Solr core.

## Signature

```javascript
generateCreateTableStatement(pMeadowTableSchema)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pMeadowTableSchema` | `object` | Meadow table schema with `TableName` and `Columns` array |

## Return Value

| Property | Type | Description |
|----------|------|-------------|
| `operation` | `string` | Always `'schemaUpdate'` |
| `collection` | `string` | The collection name from `TableName` |
| `fields` | `array` | Array of `{ name, type }` field definitions |

## Schema Object Format

```javascript
let tmpSchema =
{
	TableName: 'Animal',
	Columns:
	[
		{ Column: 'IDAnimal', DataType: 'ID' },
		{ Column: 'GUIDAnimal', DataType: 'GUID' },
		{ Column: 'Name', DataType: 'String' },
		{ Column: 'Age', DataType: 'Numeric' },
		{ Column: 'Weight', DataType: 'Decimal' },
		{ Column: 'Description', DataType: 'Text' },
		{ Column: 'CreateDate', DataType: 'DateTime' },
		{ Column: 'Deleted', DataType: 'Boolean' },
		{ Column: 'IDFarm', DataType: 'ForeignKey' }
	]
};
```

## Basic Usage

```javascript
let tmpDescriptor = _Fable.MeadowSolrProvider.generateCreateTableStatement(tmpSchema);

console.log(tmpDescriptor.operation);   // => 'schemaUpdate'
console.log(tmpDescriptor.collection);  // => 'Animal'
console.log(tmpDescriptor.fields);
```

Output fields:

```javascript
[
	{ name: 'IDAnimal', type: 'pint' },
	{ name: 'GUIDAnimal', type: 'string' },
	{ name: 'Name', type: 'string' },
	{ name: 'Age', type: 'pint' },
	{ name: 'Weight', type: 'pfloat' },
	{ name: 'Description', type: 'text_general' },
	{ name: 'CreateDate', type: 'pdate' },
	{ name: 'Deleted', type: 'pint' },
	{ name: 'IDFarm', type: 'pint' }
]
```

## Field Type Mapping

| Meadow DataType | Solr Field Type | Purpose |
|-----------------|-----------------|---------|
| `ID` | `pint` | Integer primary key |
| `GUID` | `string` | Exact-match identifier |
| `ForeignKey` | `pint` | Integer foreign key |
| `Numeric` | `pint` | Integer value |
| `Decimal` | `pfloat` | Floating-point value |
| `String` | `string` | Exact-match string (not tokenized) |
| `Text` | `text_general` | Full-text analyzed field |
| `DateTime` | `pdate` | Date/time value |
| `Boolean` | `pint` | Integer boolean (0/1) |
| Default | `string` | Fallback for unrecognized types |

## Inspecting Without Applying

Use this method to preview what schema fields would be created:

```javascript
let tmpDescriptor = _Fable.MeadowSolrProvider.generateCreateTableStatement(tmpSchema);

console.log(`Collection: ${tmpDescriptor.collection}`);
console.log(`Fields (${tmpDescriptor.fields.length}):`);
tmpDescriptor.fields.forEach(
	(pField) =>
	{
		console.log(`  ${pField.name}: ${pField.type}`);
	});
```

## Using with the Solr Schema API

The descriptor's fields array maps directly to the Solr Schema API format. Each field can be sent as an `add-field` command:

```javascript
let tmpDescriptor = _Fable.MeadowSolrProvider.generateCreateTableStatement(tmpSchema);

// Each field maps to a Schema API add-field call:
// POST /solr/<collection>/schema
// { "add-field": { "name": "IDAnimal", "type": "pint" } }
```

## Differences from SQL DDL

| Feature | SQL Connectors | Solr |
|---------|---------------|------|
| Output | SQL DDL string | Descriptor object with fields array |
| Type system | `INT`, `VARCHAR`, `TEXT` | `pint`, `pfloat`, `string`, `text_general`, `pdate` |
| Size constraints | Enforced | Not applicable |
| Primary key | Inline declaration | Application-managed |
| Full-text search | Separate indexes | Built-in via `text_general` field type |

## Related

- [createTable](createTable.md) -- Generate and prepare schema
- [createTables](createTables.md) -- Prepare multiple schemas
- [generateDropTableStatement](generateDropTableStatement.md) -- Generate drop descriptor
- [Schema & Field Types](../schema.md) -- Full type mapping reference
