export default function render(obj:string|HTMLEntity): string {

    if (!obj || typeof obj === 'string') return obj

    let attrs = ''
    for (let key of Object.keys(obj))
        if (HTMLAttr.includes(key as any))
            attrs += `${key}="${obj[key as keyof HTMLEntity]}" `

    if (!obj.children)
        return `<${obj.name}${attrs ? ' ' + attrs : ''}></${obj.name}>`

    if (Array.isArray(obj.children)) for (let i = 0; i < obj.children.length; i++) {

        let child = obj.children[i] as HTMLEntity
        let change = child.layout ? child.layout(obj.children, i) : null
        if(!change)
            continue

        let [repl, length] = change
        for (let j = i; j < length; j++)
            obj.children[i].layout = undefined

        obj.children.splice(i, length, repl)
    }

    let children = Array.isArray(obj.children) ?
        obj.children.map(render).join('') :
        render(obj.children)

    if (obj.name) return `<${obj.name}${attrs ? ' ' + attrs : ''}>${
        children
    }</${obj.name}>`

    return children
}

export type HTMLEntity = { [key in AnyAttr]?: string } & {
    name?: string,
    source?: any, 
    children?: string | HTMLEntity[],
    layout?: (siblings: HTMLEntity[], pos: number) => 
        undefined|[HTMLEntity, number]
}

type AnyAttr = typeof HTMLAttr[number] & string // TODO remove
const HTMLAttr = [
    'id', 'class',  
    'style',
    'src', 'href'
    // TODO allow all HTML attrs
] as const