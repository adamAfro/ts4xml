import { Element, Property, AnyType, SimpleType, RestrictedType, ReferenceType } from './types.d.ts'

export default function schemize(elements: Element[], indent = '  ') {

    let schema = new Tag('schema', null, { 'xmlns:xs': 'http://www.w3.org/2001/XMLSchema' })
    let converted = [] as Tag[]
    for (let element of elements) {

        let props = element.properties as Property[]
        let children = props.filter(p => p.name === 'children')
        let attrs = props.filter(p => p.name !== 'children')

        let complx = new Tag('complexType')
            complx.value = [] as Tag[]

        converted.push(new Tag('element', [complx], { name: element.name }))
        for (let property of attrs)
            complx.value.push(AttributeTag.fromType(property.name, property.types))
    }

    schema.value = converted

    return schema
}

function children(types:AnyType[]) {

    throw new Error('Not implemented yet')
}

function xstype(type:SimpleType): string {

    switch (type) {
        case 'any': return 'xs:anyType'
        case 'boolean': return 'xs:boolean'
        case 'number': return 'xs:decimal'
        case 'string': return 'xs:string'
        case 'null': return 'xs:null'
        case 'undefined': return 'xs:undefined'
    }

}

class Tag {
    
    name: string
    value: null|(string|Tag)[]
    attrs: Record <string, string>

    constructor(name:string, value: null|(string|Tag)[] = null, attrs:Record <string, string> = {}) {
    
        this.name = name
        this.value = value
        this.attrs = attrs
    }

    toString(level = 0, indent = '  ') {

        let indentation = '\n' + indent.repeat(level)

        let attributes = ' ' + Object.entries(this.attrs)
            .map(([k, v]) => `${k}="${v}"`).join(' ')

        if (this.value === null)
            return indentation+`<${this.name}${attributes} />`
        
        return indentation+`<xs:${this.name}${attributes}>`+
            `${this.stringifyValue(level+1,indent)}`+
            indentation+`</xs:${this.name}>`
    }

    stringifyValue(level = 0, indent = '  '): string {

        let indentation = '\n' + indent.repeat(level)

        if (this.value === null)
            return ''
            
        return indentation+this.value.map(v => typeof v === 'string' ? v : v.toString(level+1, indent)).join('')
    }
}

class AttributeTag extends Tag {
    
    constructor(name: string, value: null|(string|Tag)[], attrs:Record <string, string> = {}) {
        super('xs:attribute', value, Object.assign({}, attrs, { name }))
    }

    static fromType(name:string, types:AnyType[]): Tag {

        let references = types.filter(t => t.hasOwnProperty('references')) as ReferenceType[]
        if (references.length > 0)
            throw new Error('Attribute cannot have references')
    
        let restricted = types.filter(t => t.hasOwnProperty('value')) as RestrictedType[]
        let simple = types.filter(t => typeof t === 'string') as SimpleType[]
    
        if (restricted.length > 0 && simple.length > 0)
            throw new Error('Not implemented yet')
    
        if (restricted.length > 0) {
    
            let allowed = restricted.map(a => new Tag('enumeration', null, { 
                value: a.value as string 
            }))
            
            return new Tag('restriction', allowed, { base: xstype('string') })
        }
            
        if (simple.length == 0)
            throw new Error('Attribute must have a type')
    
        if (simple.length == 1)
            return new AttributeTag(name, null, { type: xstype(simple[0]) })
        
        throw new Error('Not implemented yet')     
    }
}