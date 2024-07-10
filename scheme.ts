import { Element as Abstract, Property, AnyType, SimpleType, RestrictedType, ReferenceType } from './types.d.ts'

const XSAttrs = { 'xmlns:xs': 'http://www.w3.org/2001/XMLSchema' }
export default function scheme(elements: Abstract[]) {

    let schema = new Tag('schema', [], XSAttrs)
    for (let element of elements.map(e => new Element(e.name, e.properties)))
        schema.add(Tag.fromElement(element))

    return schema
}

class Element implements Abstract {

    name: string
    properties: Property[]

    constructor(name: string, properties: Property[]) {
        this.name = name, this.properties = properties
    }

    get type() {

        if (this.properties.length === 1 && this.properties[0].name === 'children') {
            if (this.properties[0].types[0] === 'string')
                return Types.SimpleContent
        }

        return Types.Unknown
    }

    getSimple() {

        let simple = this.properties
            .filter(p => p.types.length === 1 && p.types[0] === 'string') as unknown
        
        return simple as Property[]
    }

    getAttributes() {

        let attributes = this.properties
            .filter(p => p.name !== 'children') as unknown
        
        return attributes as Property[]
    }

    getChildren() {

        let children = this.properties
            .find(p => p.name === 'children') as unknown
        
        return children as Property
    }
}

enum Types {

    SimpleContent,
    ElementContent,
    MixedContent,
    RestrictedContent,
    Unknown
}


function prefix(type: SimpleType): string {

    switch (type) {
        case 'any':         return 'xs:anyType'
        case 'boolean':     return 'xs:boolean'
        case 'number':      return 'xs:decimal'
        case 'string':      return 'xs:string'
        case 'null':        return 'xs:null'
        case 'undefined':   return 'xs:undefined'
        default: throw new Error(`${JSON.stringify(type)} is not a valid xs:type`)
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

    static fromElement(element:Element) {

        if (element.type === Types.SimpleContent)
            return Tag.simple(element)

        let complex = new Tag('complexType')

        let attrs = element.getAttributes()
        for (let property of attrs)
            complex.add(Tag.createAttribute(property.types, {
                name: property.name, mandatory: property.mandatory
            }))

        let children = element.getChildren()
        if (children) complex.add(Tag.createChildren(children.types, {
            name: element.name, 
            multiple: children.multiple, 
            mandatory: children.mandatory
        }))
        
        return Tag.stack([['element', { name: element.name }]], [complex])
    }

    static simple(element: Element) {

        return new Tag('element', null, { 
            name: element.name, 
            type: prefix(element.getSimple()[0].types[0] as SimpleType)
        })
    }

    static stack(flow: [string, Record <string, string>][] = [], value: null|(string|Tag)[] = null): Tag {

        flow = flow.reverse()
        let tag = new Tag(flow[0][0], value, flow[0][1])
        for (let [name, attrs] of flow)
            value = [new Tag(name, value, attrs)]

        return tag
    }

    add(...added:(string|Tag)[]) {
        
        if (this.value === null) 
            this.value = []
        
        this.value.push(...added)
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

    static createAttribute(types:AnyType[], {
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
            
            return new Tag('restriction', allowed, { base: prefix('string') })
        }
            
        if (simple.length == 0)
            throw new Error('Attribute must have a type: ' + name)
    
        if (simple.length == 1) return new Tag('attribute', null, { 
type: prefix(simple[0]), ...(mandatory ? { use: 'required' } : {}),
            name: name,
                    })
        
        throw new Error('Not implemented yet')     
    }
}