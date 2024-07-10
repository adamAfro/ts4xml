import { Element, Property, AnyType, SimpleType, RestrictedType, ReferenceType } from './types.d.ts'

export default function scheme(elements: Element[], indent = '  ') {

    let schema = new Tag('schema', null, { 'xmlns:xs': 'http://www.w3.org/2001/XMLSchema' })
    let converted = [] as Tag[]
    for (let element of elements) {

        let props = element.properties as Property[]
        if (props.length === 1 && props[0].name === 'children' && typeof props[0].types[0] === 'string') {

            converted.push(new Tag('element', null, { 
                name: element.name, type: xstype(props[0].types[0])
            }))

            continue
        }

        let complx = new Tag('complexType')
            complx.value = [] as Tag[]
converted.push(Tag.stack([['element', { name: element.name }]], [complx]))

let attrs = props.filter(p => p.name !== 'children')
                for (let property of attrs)
            complx.value.push(AttributeTag.fromType(property.types, {
                name: property.name, mandatory: property.mandatory
            }))

        let children = props.filter(p => p.name === 'children')
        for (let child of children)
            complx.value.push(Tag.createChildren(child.types, {
                name: element.name, 
                multiple: child.multiple, 
                mandatory: child.mandatory
            }))

    }

    schema.value = converted

    return schema
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

    static stack(flow: [string, Record <string, string>][] = [], value: null|(string|Tag)[] = null): Tag {

        flow = flow.reverse()
        let tag = new Tag(flow[0][0], value, flow[0][1])
        for (let [name, attrs] of flow)
            value = [new Tag(name, value, attrs)]

        return tag
    }

    toString(level = 0, indent = '  ') {

        let indentation = '\n' + indent.repeat(level)

        let attributes = ' ' + Object.entries(this.attrs)
            .map(([k, v]) => `${k}="${v}"`).join(' ')

        if (this.value === null)
            return indentation+`<xs:${this.name}${attributes} />`
        
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

    static createChildren(types:AnyType[], { name, 
        multiple = false, mandatory = false
    }: {
        name: string, multiple?: boolean, mandatory?: boolean
    }) {
    
        if (types.length === 1) {
            
            if (types[0].hasOwnProperty('reference')) return Tag.stack([
                ['sequence', {}]
            ], [new Tag('element', null, { 
                ref: (types[0] as ReferenceType).reference,
                minOccurs: mandatory ? '1' : '0',
                maxOccurs: multiple ? 'unbounded' : '1'
            })])

            if (types[0].hasOwnProperty('value'))
                throw new Error('Not implemented yet')
            
            throw new Error('Should not happen')
        }
    
        throw new Error('Not implemented yet')
    }
}

class AttributeTag extends Tag {
    
    constructor(name: string, value: null|(string|Tag)[], attrs:Record <string, string> = {}) {
        super('attribute', value, Object.assign({}, attrs, { name }))
    }

    static fromType(types:AnyType[], {
        name, mandatory
    }: { name:string, mandatory:boolean }): Tag {

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
    
        if (simple.length == 1) return new AttributeTag(name, null, { 
            type: xstype(simple[0]), ...(mandatory ? { use: 'required' } : {})
        })
        
        throw new Error('Not implemented yet')     
    }
}