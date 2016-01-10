'use strict';

////////////////////////////////////////////////////
// Converts a single value into its Postgres format.
// All known data types are supported.
//
// It can only fail in the following cases:
//   1. function-parameter or custom type throw an error;
//   2. 'value' = null/undefined, while 'raw' = true;
//   3. function-parameter returns null/undefined,
//      while 'raw' = true.
function formatValue(value, raw, obj) {
    if (isNull(value)) {
        throwIfRaw(raw);
        return 'null';
    }
    switch (typeof value) {
        case 'string':
            return $as.text(value, raw);
        case 'boolean':
            return $as.bool(value);
        case 'number':
            return $as.number(value);
        case 'function':
            return $as.func(value, raw, obj);
        default:
            // type = 'object';
            var ctf = value['formatDBType']; // custom type formatting;
            if (ctf instanceof Function) {
                return formatValue(resolveFunc(ctf, value), raw || value._rawDBType);
            }
            if (value instanceof Date) {
                return $as.date(value, raw);
            }
            if (value instanceof Array) {
                return $as.array(value);
            }
            return $as.json(value, raw);
    }
}
