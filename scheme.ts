import { Element as Abstract, Property, AnyType, SimpleType, RestrictedType, ReferenceType } from './types.d.ts'

const XSAttrs = { 'xmlns:xs': 'http://www.w3.org/2001/XMLSchema' }
export default function scheme(elements: Abstract[]) {

    let schema = new Tag('schema', [], XSAttrs)
    for (let element of elements.map(e => new Element(e.name, e.properties)))
        schema.add(Tag.fromElement(element))

    return schema
}

enum Content { Empty, Simple, Complex, ComplexMixed }
enum Attribution { None, Simple, Reference, Complex }
class Element implements Abstract {

    name: string
    properties: Property[]

    constructor(name: string, properties: Property[]) {
        this.name = name, this.properties = properties
    }

    getContentType(): undefined|Content {

        if (this.properties.length == 0)
            return Content.Empty

        if (this.properties.some(p => p.name === 'children')) {

            let children = this.properties.find(p => p.name === 'children') as Property

            if (children.types.length === 1 && children.types[0] === 'string')
                return Content.Simple

            if (children.types.length > 1) {

                if (children.types.some(t => typeof t === 'string'))
                    return Content.ComplexMixed

                return Content.Complex
            }
        }
    }

    getAttributionType(): undefined|Attribution {

        let attrs = this.getAttributes()
        if (attrs.length === 0)
            return Attribution.None
    
        if (this.getAttributes().length > 0)
            return Attribution.Complex

        return Attribution.Simple
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
    value: null|Tag[]
    attrs: Record <string, string>

    constructor(name:string, value: null|Tag[] = null, attrs:Record <string, string> = {}) {
    
        this.name = name
        this.value = value
        this.attrs = attrs
    }

    static fromElement(element:Element) {

        let content = element.getContentType()
        let attribution = element.getAttributionType()
        if (content === Content.Empty)
            return Tag.stack([
                ['element', { name: element.name }],
                ['simpleType', {}],
                ['restriction', { base: 'xs:string' }],
                ['length', { value: '0' }]
            ])

        if (content === Content.Simple && attribution === Attribution.None)
            return Tag.simple(element)

        let complex = new Tag('complexType', [], {
            ...(content === Content.ComplexMixed ? { mixed: 'true' } : {})
        })

        let attrs = element.getAttributes()
        for (let property of attrs)
            complex.add(Tag.createAttribute(property.types, {
                name: property.name, mandatory: property.mandatory
            }))

        let children = element.getChildren()
        if (children) {

            if (content === Content.Simple)
                complex.set('mixed', 'true')
            else complex.add(Tag.createChildren(content!, children.types, {
                name: element.name, 
                multiple: children.multiple, 
                mandatory: children.mandatory
            }))
        }
        
        return Tag.stack([['element', { name: element.name }]], [complex])
    }

    static simple(element: Element) {

        return new Tag('element', null, { 
            name: element.name, 
            type: prefix(element.getSimple()[0].types[0] as SimpleType)
        })
    }

    static stack(flow: [string, Record <string, string>][] = [], value: null|Tag[] = null): Tag {

        flow = flow.reverse()
        let tag = new Tag(flow[0][0], value, flow[0][1])
        for (let [name, attrs] of flow) {
            tag = new Tag(name, value, attrs)
            value = [tag]    
        }

        return tag
    }

    add(...added:Tag[]) {
        
        if (this.value === null) 
            this.value = []
        
        this.value.push(...added)
    }

    set(key:string, value:string) {
        this.attrs[key] = value
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

        let indentation = indent.repeat(level)

        if (this.value === null)
            return ''
            
        return indentation + this.getOrderedValue()
            .map(t => t.toString(level + 1, indent)).join('')
    }

    getOrderedValue(): Tag[] {

        const Order = ['sequence', 'attribute']
        return this.value?.sort((a, b) => {

            let aIndex = Order.indexOf((a as Tag).name)
            let bIndex = Order.indexOf((b as Tag).name)
            return aIndex - bIndex

        }) || []
    }

    static createChildren(content: Content, types:AnyType[], { 
        name, multiple = false, mandatory = false
    }: {
        name: string, multiple?: boolean, mandatory?: boolean
    }) {
    
        if (types.length === 1) {
            
            if (types[0].hasOwnProperty('reference')) return Tag.stack([
                ['choice', {
                    minOccurs: mandatory ? '1' : '0',
                    maxOccurs: multiple ? 'unbounded' : '1'
                }]
            ], [new Tag('element', null, { 
                ref: (types[0] as ReferenceType).reference
            })])

            if (types[0].hasOwnProperty('value'))
                throw new Error('Not implemented yet')
            
            return Tag.stack([
                ['choice', {
                    minOccurs: mandatory ? '1' : '0',
                    maxOccurs: multiple ? 'unbounded' : '1'
                }]
            ], [new Tag('element', null, {
                type: prefix(types[0] as SimpleType)
            })])
        }

        let simple = types.filter(t => typeof t === 'string') as SimpleType[]

        let restrictions = types.filter(t => t.hasOwnProperty('value')) as RestrictedType[]
        if (restrictions.length > 0)
            throw new Error('Not implemented yet')
   
        let references = types.filter(t => t.hasOwnProperty('reference')) as ReferenceType[]
        if (multiple) return new Tag('choice', references.map(r => new Tag('element', null, { 
            ref: r.reference
        })), { minOccurs: '0', maxOccurs: 'unbounded' })

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
            
            return Tag.stack([
                
                ['attribute', { name }],
                ['simpleType', {}],
                ['restriction', { base: prefix('string') }]
            
            ], allowed)
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