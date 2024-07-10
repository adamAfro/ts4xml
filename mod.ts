import { default as extract } from './extract.ts'
import { default as scheme } from './scheme.ts'

export { extract, scheme }

export default function(input:string, output:string) {

    let code = Deno.readTextFileSync(input)
    let types = extract(code)
    let schema = scheme(types)

    schema.toString()
    Deno.writeTextFileSync(output, schema.toString())
}