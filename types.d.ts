interface Element { name: string, properties: Property[] }
type SimpleType = 'any'|'boolean'|'number'|'string'|'null'|'undefined'
type RestrictedType = { value: number|string }
type ReferenceType = { reference: string }
type AnyType = SimpleType|RestrictedType|ReferenceType
interface Property { 
    name: string,
    mandatory: boolean,
    types: (SimpleType|RestrictedType|ReferenceType)[]
    multiple?: boolean
}