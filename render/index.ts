export default function render(obj:string|HTMLEntity): string {

    if (!obj || typeof obj === 'string') return obj

    let attrs = ''
    for (let key of Object.keys(obj))
        if (HTMLAttr.includes(key as any))
            attrs += `${key}="${obj[key as keyof HTMLEntity]}" `

    if (obj.data) for (let key of Object.keys(obj.data))
        attrs += `data-${key}="${obj.data[key]}" `

    if (!obj.children)
        return `<${obj.tag}${attrs ? ' ' + attrs : ''}></${obj.tag}>`

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

    if (obj.tag) return `<${obj.tag}${attrs ? ' ' + attrs : ''}>${
        children
    }</${obj.tag}>`

    return children
}

export type HTMLEntity = { [key in typeof HTMLAttr[number]]?: string } & {
    tag?: string,
    source?: any,
    children?: string | HTMLEntity[],
    data?: { [key:string]: any },
    layout?: (siblings: HTMLEntity[], pos: number) => 
        undefined|[HTMLEntity, number]
}

const HTMLAttr = [
    'id', 'class',  
    'style',
    'src', 'href', 'target',
    'name'
    // TODO allow all HTML attrs
] as const