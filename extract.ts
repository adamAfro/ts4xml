import { Node as TypescriptNode, SyntaxKind, JSDoc } from "https://esm.sh/typescript@4.9.5"
import { createSourceFile, ScriptTarget } from "https://esm.sh/typescript@4.9.5"

import { Element, Property, SimpleType, RestrictedType, ReferenceType } from './types.d.ts'

// TODO deistinguish to 2 types of nodes
type Node = TypescriptNode & { 
    escapedText: undefined|string 
    text: undefined|string
}

namespace Extracting {

    export function constr(node:TypescriptNode): Element {

        let properties = [] as Property[]
        let members = Finding.all(node, SyntaxKind.Parameter)
        try {

            for (let member of members) {
                let isPublic = Finding.any(member, SyntaxKind.PublicKeyword)
                if (!isPublic) continue
                properties.push(prop(member))
            }
                

        } catch (error) { console.warn(error.message, 'in', 'constructor') }

        return { name: 'constructor', properties }
    }

    export function cls(node:TypescriptNode): Element {

        let id = Finding.any(node, SyntaxKind.Identifier)
        if(!id) throw new Error('No interface identifier found')
        let name = id.escapedText as string

        let properties = [] as Property[]
        let members = Finding.all(node, SyntaxKind.PropertyDeclaration)
       
        try {

            for (let mebmer of members)
                properties.push(prop(mebmer))

        } catch (error) { console.warn(error.message, 'in', name) }

        let constructor = Finding.any(node, SyntaxKind.Constructor)
        if(!constructor) return { name, properties }
        
        properties.push(...constr(constructor).properties)

        console.log(name, properties)


        return { name, properties }
    }
    
    export function interf(node:TypescriptNode): Element {

        let id = Finding.any(node, SyntaxKind.Identifier)
        if(!id) throw new Error('No interface identifier found')
        let name = id.escapedText as string

        let properties = [] as Property[]
        let members = Finding.all(node, SyntaxKind.PropertySignature)
       
        try {

            for (let mebmer of members)
                properties.push(prop(mebmer))

        } catch (error) { console.warn(error.message, 'in', name) }

        return { name, properties }
    }

    function prop(node:TypescriptNode): Property {

        let property = {} as Property

        let id = Finding.any(node, SyntaxKind.Identifier)
        if (id)
            property.name = id.escapedText as string
        let qmark = Finding.any(node, SyntaxKind.QuestionToken)
        if(!qmark)
            property.mandatory = true

        let typer = Finding.any(node, Kinds)
        if(!typer)
            throw new Error(`No type found within ${SyntaxKind[node.kind]}`)
        
        let type = typein(typer)
        return { ...property, ...type }
    }

    function typein(node:Node): any {

        if (NotSupported.some(test => test === node.kind))
            throw new Error(`${SyntaxKind[node.kind]} not supported`)
        if (NotImplemented.some(test => test === node.kind))
            throw new Error(`${SyntaxKind[node.kind]} not implemented`)

        if (Mapping.has(node.kind))
            return { types: [Mapping.get(node.kind) as SimpleType] }
        
        if (node.kind === SyntaxKind.LiteralType) {

            let value = []
            for (let container of Finding.all(node, SyntaxKind.StringLiteral))
                value.push(container.text)

            for (let container of Finding.all(node, SyntaxKind.NumericLiteral))
                value.push(Number(container.text))

            return { types: [{ value: [...value]}],  }
        }

        if (node.kind === SyntaxKind.TypeQuery) {

            let ref = Finding.any(node, SyntaxKind.Identifier)
            if(!ref) throw new Error('No reference identifier found')    
            return { types: [{reference: ref.escapedText as string}] }
        }

        if (node.kind === SyntaxKind.TypeReference) {

            let ref = Finding.any(node, SyntaxKind.Identifier)
            if(!ref) throw new Error('No reference identifier found')
            if (ref.escapedText !== 'ReturnType')
                return { types: [{reference: ref.escapedText as string}] }

            let query = Finding.any(node, SyntaxKind.TypeQuery)
            if(!query) throw new Error('No type query found')
            return { types: typein(query).types }
        }

        if (NestingKind.some(test => test === node.kind)) {

            let types = []
            for (let container of Finding.all(node, Kinds))
                types.push(...typein(container).types)

            return { 
                types, multiple: node.kind as SyntaxKind === SyntaxKind.ArrayType
            }
        }

        return { types: [node.escapedText as SimpleType] }
    }

    const Mapping = new Map([
        [SyntaxKind.AnyKeyword, 'any'],
        [SyntaxKind.BooleanKeyword, 'boolean'],
        [SyntaxKind.NumberKeyword, 'number'],
        [SyntaxKind.StringKeyword, 'string'],
        [SyntaxKind.VoidKeyword, 'void'],
        [SyntaxKind.NullKeyword, 'null'],
        [SyntaxKind.UndefinedKeyword, 'undefined'],
    ])

    const NestingKind = [
        SyntaxKind.ParenthesizedType,
        SyntaxKind.UnionType,
        SyntaxKind.ArrayType,
    ]

    const NotImplemented = [
        SyntaxKind.TupleType,
        SyntaxKind.SpreadElement,
    ]

    const NotSupported = [
        SyntaxKind.BigIntKeyword,
        SyntaxKind.SymbolKeyword,
        SyntaxKind.NeverKeyword,
        SyntaxKind.InterfaceKeyword,
        SyntaxKind.ClassKeyword,
        SyntaxKind.FunctionKeyword,
        SyntaxKind.ObjectKeyword,
        SyntaxKind.EnumKeyword,
        SyntaxKind.UnknownKeyword,
    ]

    const Kinds = [
        SyntaxKind.TypeQuery,
        SyntaxKind.TypeReference,
        SyntaxKind.LiteralType,
        ...Mapping.keys(),
        ...NestingKind,
        ...NotImplemented, 
        ...NotSupported,
    ]
}

namespace Finding {

    export function any(node:TypescriptNode, kinds:SyntaxKind|SyntaxKind[], {
        verbose = false
    } = {}) {

        if (!Array.isArray(kinds)) kinds = [kinds]

        let result: Node|null = null
        node.forEachChild(c => (kinds.some(test => test === c.kind)) ? (result = c as Node) : null)

        if (verbose) {
            let present = [] as string[]
            node.forEachChild(c => void present.push(SyntaxKind[c.kind]))
            console.log({
                present, 
                searched: kinds.map(k => SyntaxKind[k]),
                found: result ? SyntaxKind[(result as Node).kind] : null,
            })
        }
    
        return result as null|Node
    }
    
    export function all(node:TypescriptNode, kinds:SyntaxKind|SyntaxKind[], {
        verbose = false
    } = {}) {

        if (!Array.isArray(kinds)) kinds = [kinds]
        
        let results: Node[] = []
        node.forEachChild(c => (kinds.some(test => test === c.kind)) ? void results.push(c as Node) : null)
   
        if (verbose) {
            let present = [] as string[]
            node.forEachChild(c => void present.push(SyntaxKind[c.kind]))
            console.log({
                present, 
                searched: kinds.map(k => SyntaxKind[k]),
                found: results.map(r => SyntaxKind[r.kind]),
            })
        }
    
        return results
    }
}

function crawl(node: TypescriptNode & { jsDoc?: JSDoc[] }, data = [] as Element[], level = 0) {
    
    try {
        
        if (node.kind === SyntaxKind.ClassDeclaration) {
            
            const jsDocs = node.jsDoc as JSDoc[]
            const hasXSDTag = jsDocs?.some(doc => doc.tags?.some(tag => tag.tagName.text === 'schema'))
            if (hasXSDTag) {
                data.push(Extracting.cls(node))
            }
        }

        node.forEachChild(c => void crawl(c, data, level + 1))
    } catch (error) {
        console.warn(error.message)
    }

    return data
}

export default function extract(code: string) {
    
    const file = createSourceFile('code.ts', code, ScriptTarget.Latest, /*setParentNodes */ true);

    return crawl(file)
}