export interface Element { name: string, properties: Property[] }
export type SimpleType = 'any'|'boolean'|'number'|'string'|'null'|'undefined'
export type RestrictedType = { value: number|string }
export type ReferenceType = { reference: string }
export type AnyType = SimpleType|RestrictedType|ReferenceType
export interface Property { 
    name: string,
    mandatory: boolean,
    types: (SimpleType|RestrictedType|ReferenceType)[]
    multiple?: boolean
}